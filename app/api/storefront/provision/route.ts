/** Create an organization and its administrator from a completed payment.
 *
 *  This replaces the signup form. Payment happens on the storefront, which
 *  calls this endpoint; the administrator never fills anything in, and receives
 *  a link to choose their own password.
 *
 *  Lives under /api/storefront rather than /api/webhooks: the two endpoints
 *  here share a caller and a shared secret, but only this one is a webhook in
 *  the sense of being driven by an event with nobody waiting. Its neighbour is
 *  a query somebody is sitting in front of. Naming the namespace after the
 *  caller covers both honestly.
 *
 *  The order of the checks is the order of their cost. A forged request is
 *  rejected on the signature before the body is parsed; a retry is answered
 *  from the ledger before PayPal is called; a name collision is found before
 *  anything is written.
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/app/api/prisma.dev';
import { verifySignedRequest } from '@/app/api/_lib/hmacGuard';
import { rateLimit } from '@/app/api/_lib/rateLimit';
import { FIELD_CONTRACT, provisionSchema, unknownFields } from './schema';
import {
  findPlan,
  normalizeInstitution,
  normalizePlan,
  type InstitutionType,
  type PlanType,
} from '@/app/lib/billing/catalog';
import { addInterval, verifyPayment, type VerifiedPayment } from '@/app/lib/billing/verify';
import { issuePasswordToken, passwordLink } from '@/app/lib/auth/passwordToken';
import { sendWelcomeEmail } from './email';
import crypto from 'crypto';

const SOURCE = 'provision';

/** Record what we answered, so a retry can be answered identically. */
async function remember(
  idempotencyKey: string,
  statusCode: number,
  body: unknown,
  extra: { paymentReference?: string | null; org?: string | null } = {},
) {
  try {
    // upsert, not create: a refused call can be corrected and resent under the
    // same key, which would otherwise collide on the unique index.
    await prisma.webhook_deliveries.upsert({
      where: {
        source_idempotency_key: { source: SOURCE, idempotency_key: idempotencyKey },
      },
      update: {
        payment_reference: extra.paymentReference ?? null,
        status_code: statusCode,
        response: body as any,
        org: extra.org ?? null,
      },
      create: {
        source: SOURCE,
        idempotency_key: idempotencyKey,
        payment_reference: extra.paymentReference ?? null,
        status_code: statusCode,
        response: body as any,
        org: extra.org ?? null,
      },
    });
  } catch (err) {
    // A duplicate key here means two identical calls raced. The organization is
    // created inside a transaction keyed on unique columns, so only one of them
    // can have succeeded; losing this ledger row is not worth failing over.
    console.error('provision: could not record delivery', err);
  }
}

export async function POST(req: Request) {
  // Signature first: an unsigned request should not cost us a database read.
  const signed = await verifySignedRequest(req);
  if (!signed.ok) return signed.response;

  const idempotencyKey = req.headers.get('x-idempotency-key')?.trim();
  if (!idempotencyKey) {
    return NextResponse.json(
      { ok: false, error: 'Missing X-Idempotency-Key.' },
      { status: 400 },
    );
  }

  // Generous, because a legitimate storefront makes one call per sale — but
  // finite, so a loop cannot be used to probe PayPal references through us.
  const tooMany = rateLimit(req, { key: 'provision', limit: 60, windowMs: 60 * 60_000 });
  if (tooMany) return tooMany;

  // A retry of a call that SUCCEEDED replays the answer rather than
  // provisioning a second time. A retry of one that failed is allowed through.
  //
  // Only successes are replayed, deliberately. A rejected call is a call the
  // storefront is expected to correct and send again — a clashing organization
  // name, a plan typo — and the natural way to send it again is with the same
  // idempotency key. Replaying the refusal would cache it forever and make the
  // collision unrecoverable without the caller knowing to invent a new key.
  // Failures are still recorded, for diagnosis; they are just not final.
  const seen = await prisma.webhook_deliveries.findFirst({
    where: { source: SOURCE, idempotency_key: idempotencyKey, status_code: 201 },
    select: { status_code: true, response: true },
  });
  if (seen) {
    return NextResponse.json(
      { ...(seen.response as object), replayed: true },
      { status: 200 },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(signed.raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'Body is not valid JSON.' }, { status: 400 });
  }

  const validation = provisionSchema.safeParse(parsed);
  const unknown = unknownFields(parsed);

  if (!validation.success) {
    const details = validation.error.issues.map((i) => ({
      field: i.path.join('.') || '(body)',
      // Zod's own wording for a missing key is "Invalid input", which tells an
      // integrator nothing. Say what the field is for instead.
      message:
        i.code === 'invalid_type' && (i as any).received === 'undefined'
          ? 'Required.'
          : i.message,
    }));

    const body = {
      ok: false,
      error: 'Some fields are missing or malformed.',
      details,
      // Reported rather than ignored: a field name we do not recognise is
      // almost always a typo for one we do, and "organisation_name" would
      // otherwise show up only as organization_name being absent.
      ...(unknown.length ? { unknown_fields: unknown } : {}),
      // The contract, returned with the refusal, so the answer to "what does
      // this endpoint need" is the refusal itself.
      expected: FIELD_CONTRACT,
    };
    await remember(idempotencyKey, 400, body);
    return NextResponse.json(body, { status: 400 });
  }

  if (unknown.length) {
    // Valid, but worth saying: these were dropped, and one of them may have
    // been meant as something else.
    console.warn(`provision: ignoring unknown fields: ${unknown.join(', ')}`);
  }

  const input = validation.data;

  const institutionType = normalizeInstitution(input.product_category);
  const planName = normalizePlan(input.product_plan);

  // The schema has already checked both against the catalogue's lists, so this
  // can only fire for a combination that exists as names but not as a sold
  // plan — which is what findPlan answers.
  if (!institutionType || !planName || !findPlan(institutionType, planName)) {
    const body = {
      ok: false,
      error: `PES does not sell a ${input.product_plan} plan for ${input.product_category}.`,
      expected: FIELD_CONTRACT,
    };
    await remember(idempotencyKey, 400, body);
    return NextResponse.json(body, { status: 400 });
  }

  // Email collision before payment verification: cheap, and a refusal the
  // storefront should have caught with /availability. Organization name is
  // NOT checked — two orgs may legitimately share a name (each is identified
  // by org.id, not name), so there is nothing to collide on here.
  const emailTaken = await prisma.pesuser.findUnique({
    where: { email: input.admin_email },
    select: { id: true },
  });

  if (emailTaken) {
    const body = {
      ok: false,
      error: 'That administrator email is already registered.',
      field: 'admin_email',
    };
    await remember(idempotencyKey, 409, body, { paymentReference: input.payment_reference });
    return NextResponse.json(body, { status: 409 });
  }

  // One payment provisions one organization, whatever idempotency key it
  // arrives under.
  const referenceUsed = await prisma.subscriptions_info.findUnique({
    where: { reference: input.payment_reference },
    select: { org: true },
  });
  if (referenceUsed) {
    const body = {
      ok: false,
      error: `That payment has already been used to create ${referenceUsed.org}.`,
      organization: referenceUsed.org,
    };
    await remember(idempotencyKey, 409, body, { paymentReference: input.payment_reference });
    return NextResponse.json(body, { status: 409 });
  }

  const payment = await confirmPayment(input.payment_reference, institutionType, planName);
  if ('error' in payment) {
    const body = { ok: false, error: payment.error };
    await remember(idempotencyKey, 402, body, { paymentReference: input.payment_reference });
    return NextResponse.json(body, { status: 402 });
  }

  if (input.amount_paid) {
    const claimed = Math.round(parseFloat(input.amount_paid) * 100);
    if (Number.isFinite(claimed) && claimed !== payment.amount) {
      // Not a refusal: PayPal is authoritative and has already been believed.
      // Worth a log, because a persistent mismatch means the storefront and the
      // catalogue disagree about a price.
      console.warn(
        `provision: ${input.organization_name} claimed ${claimed} cents, PayPal says ${payment.amount}`,
      );
    }
  }

  // The maintenance model ships with the company product; every other sector
  // buys it separately, which is what this flag records.
  const maintenance = institutionType === 'COMPANY' || input.maintenance_model === true;

  try {
    const { userId } = await prisma.$transaction(async (tx) => {
      await tx.org.create({
        data: {
          name: input.organization_name,
          category: input.product_category.toLowerCase(),
          plan: input.product_plan.toLowerCase(),
          maintenance_model: maintenance,
        },
      });

      // A password is set so the column is never empty, but it is random and
      // discarded unread — nobody, including us, can sign in with it. The
      // administrator chooses their own through the emailed link.
      const unusable = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

      const user = await tx.pesuser.create({
        data: {
          name: input.admin_name,
          email: input.admin_email,
          password: unusable,
          role: 'admin',
          org: input.organization_name,
          category: input.product_category.toLowerCase(),
          plan: input.product_plan.toLowerCase(),
          gsm: input.admin_phone ?? null,
          image: input.organization_logo_url ?? null,
          // They will choose their own password through the link, so there is
          // nothing to force them to change afterwards.
          must_change_password: false,
        },
        select: { id: true },
      });

      await tx.subscriptions_info.create({
        data: {
          pesuser_email: input.admin_email,
          pesuser_name: input.admin_name,
          org: input.organization_name,
          plan_code: payment.plan,
          plan_name: input.product_plan.toLowerCase(),
          reference: payment.reference,
          status: 'success',
          amount: payment.amount / 100,
          paid_at: payment.paidAt,
          expires_at: payment.expiresAt,
        },
      });

      return { userId: user.id };
    });

    // Outside the transaction: the preset roles are convenience, and a failure
    // here must not undo a paid-for organization.
    try {
      const { seedPresetRoles } = await import('@/app/api/_lib/seedRoles');
      await seedPresetRoles(input.organization_name, input.product_category.toLowerCase());
    } catch (seedErr) {
      console.error('provision: preset role seeding failed (non-fatal):', seedErr);
    }

    const { token, expiresAt: linkExpires } = await issuePasswordToken(userId, 'setup');

    let emailed = true;
    try {
      await sendWelcomeEmail({
        to: input.admin_email,
        adminName: input.admin_name,
        organization: input.organization_name,
        institutionType,
        plan: planName,
        link: passwordLink(token, 'setup'),
        linkExpiresAt: linkExpires,
        accessExpiresAt: payment.expiresAt,
      });
    } catch (mailErr) {
      // The organization exists and is paid for. A failed email is recoverable
      // — they can request a new link — so it is reported, not rolled back.
      console.error('provision: welcome email failed', mailErr);
      emailed = false;
    }

    const body = {
      ok: true,
      organization: input.organization_name,
      admin_email: input.admin_email,
      plan: planName,
      product_category: institutionType,
      expires_at: payment.expiresAt.toISOString(),
      welcome_email_sent: emailed,
    };
    await remember(idempotencyKey, 201, body, {
      paymentReference: payment.reference,
      org: input.organization_name,
    });
    return NextResponse.json(body, { status: 201 });
  } catch (err: any) {
    // Two identical calls racing past the collision check: only one can win the
    // unique constraint, and the loser is a duplicate, not a failure.
    if (err?.code === 'P2002') {
      const body = {
        ok: false,
        error: 'That organization or administrator was created by a concurrent request.',
      };
      await remember(idempotencyKey, 409, body, { paymentReference: input.payment_reference });
      return NextResponse.json(body, { status: 409 });
    }
    console.error('provision: failed', err);
    return NextResponse.json(
      { ok: false, error: 'Could not create the organization. The payment was not consumed.' },
      { status: 500 },
    );
  }
}

/** Verify the reference with PayPal, or explain why not.
 *
 *  BILLING_ENFORCED=false lets the client test the flow without live
 *  credentials, and the moment it is unset or true an unverifiable
 *  reference is refused. */
async function confirmPayment(
  reference: string,
  institutionType: InstitutionType,
  planName: PlanType,
): Promise<VerifiedPayment | { error: string }> {
  const enforced = process.env.BILLING_ENFORCED !== 'false';

  const result = await verifyPayment(reference, { institutionType, plan: planName });
  if (result.ok) return result.payment;
  if (enforced) return { error: result.reason };

  const plan = findPlan(institutionType, planName)!;
  const paidAt = new Date();
  return {
    reference,
    institutionType,
    plan: planName,
    amount: plan.price,
    paidAt,
    expiresAt: addInterval(paidAt, plan.interval, plan.intervalCount),
    payerEmail: null,
  };
}
