export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { getJWTSecret } from '@/app/lib/jwt';
import { rateLimit } from '../_lib/rateLimit';
import jwt from 'jsonwebtoken'
import prisma from '../prisma.dev'
import { randomUUID } from "crypto";
import bcrypt from 'bcryptjs';
import { findPlan, normalizeInstitution, normalizePlan, type InstitutionType, type PlanType } from '@/app/lib/billing/catalog';
import { addInterval, verifySubscription, type VerifiedPayment } from '@/app/lib/billing/verify';

type reqInfo = {
  name: string
  org: string
  email: string
  password: string
  type: string
  plan: string
  category: string
  logo: string
  payment: VerifiedPayment
}

async function addToDb(info: reqInfo) {
  const { name, email, password, type, category, plan, org, logo, payment } = info;

  // Hash the password before storing — critical for security.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // The reference is PayPal's own subscription id, and the column is @unique.
  // That is what stops the same payment being used to create two organizations.
  const reference = payment.reference;

  // A transaction keeps org + user + subscription creation atomic.
  return await prisma.$transaction(async (tx) => {
    // A plain create, not an upsert. The previous upsert silently returned an
    // existing organization when the name matched, and the caller then created
    // the new user as its admin — handing a stranger control of somebody else's
    // staff, departments and appraisal data. Failing on the unique constraint is
    // the correct behaviour, and it also closes the race between two signups
    // claiming the same name at once.
    const orgRecord = await tx.org.create({
      data: {
        name: org,
        category,
        plan,
        // Not granted at signup. The maintenance model is bundled with the
        // company product (see MAINTENANCE_BY_DEFAULT, which decides that from
        // the category), and every other sector requests it from /pricing. This
        // column records only that separate purchase, so granting it here on
        // signup hid the request card from the sectors meant to see it.
        maintenance_model: false,
      },
    });

    const user = await tx.pesuser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: type || 'admin',
        image: logo,
        org,
        category,
        plan,
      },
    });

    await tx.subscriptions_info.create({
      data: {
        pesuser_email: email,
        pesuser_name: name,
        org,
        plan_code: payment.plan,
        plan_name: plan,
        reference,
        status: 'success',
        // Amounts are held in cents in the catalogue; this column is a decimal
        // of whole currency units.
        amount: payment.amount / 100,
        // The clock starts the day PayPal took the money, not the day the admin
        // got round to signing up.
        paid_at: payment.paidAt,
        expires_at: payment.expiresAt,
      },
    });

    return { user, maintenance_model: orgRecord.maintenance_model };
  });
}


// Deliberately public: account creation precedes any session.
export async function GET() {
  return NextResponse.json({ name: 'successful!', data: 'true' })
}

import { validateData, signupSchema, formatZodErrors } from '@/app/lib/validation'


/** Turn a checkout reference into a verified payment, or an error to show the
 *  buyer.
 *
 *  PES has no live PayPal credentials yet and the client is still testing the
 *  appraisal flow, so BILLING_ENFORCED=false lets signup proceed on trust. The
 *  moment that variable is unset or true, an unverifiable reference is refused.
 *  Set it to true in production before launch. */
async function confirmPayment(
  reference: unknown,
  institutionType: InstitutionType,
  planName: PlanType,
): Promise<VerifiedPayment | { error: string }> {
  const enforced = process.env.BILLING_ENFORCED !== 'false';
  const ref = typeof reference === 'string' ? reference.trim() : '';

  if (ref) {
    const result = await verifySubscription(ref, { institutionType, plan: planName });
    if (result.ok) return result.payment;
    if (enforced) return { error: result.reason };
  } else if (enforced) {
    return { error: 'Missing payment plan details.' };
  }

  // Unenforced fallback, testing only. Marked with a PES_ reference so these
  // rows are trivially distinguishable from real PayPal ones.
  const plan = findPlan(institutionType, planName)!;
  const paidAt = new Date();
  return {
    reference: ref || `PES_${randomUUID()}`,
    institutionType,
    plan: planName,
    amount: plan.price,
    paidAt,
    expiresAt: addInterval(paidAt, plan.interval, plan.intervalCount),
    payerEmail: null,
  };
}

export async function POST(req: Request) {
  const body = await req.json()

  // Account creation is public, so it is also a way to fill the table.
  const tooMany = rateLimit(req, { key: 'signup', limit: 5, windowMs: 60 * 60_000 });
  if (tooMany) return tooMany;

  const validation = validateData(signupSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { message: "Validation failed", details: formatZodErrors(validation.errors!) },
      { status: 400 }
    );
  }

  const { name, org, email, password, type, category, plan, logo, reference } = body

  // The institution type and tier must both name something the catalogue
  // actually sells. Previously these were taken from the URL unchecked, so a
  // hand-typed query string could invent a plan.
  const institutionType = normalizeInstitution(category);
  const planName = normalizePlan(plan);
  if (!institutionType || !planName || !findPlan(institutionType, planName)) {
    return NextResponse.json(
      { message: 'Missing payment plan details.' },
      { status: 400 },
    );
  }

  try {
    // Check if user exists first to fail fast
    const existing = await prisma.pesuser.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // org.name is globally unique today because 37 tables key off the name
    // rather than org.id, so two organizations sharing one would share their
    // data. Until that is fixed, refuse the duplicate with something the buyer
    // can act on. See docs/subscription-payment-flow.md section 11.
    const existingOrg = await prisma.org.findUnique({
      where: { name: org },
      select: { id: true },
    });
    if (existingOrg) {
      return NextResponse.json(
        {
          message:
            'An organization by that name is already registered. If this is your organization, ask its administrator to add you. Otherwise choose a different name.',
        },
        { status: 409 },
      );
    }

    const payment = await confirmPayment(reference, institutionType, planName);
    if ('error' in payment) {
      return NextResponse.json({ message: payment.error }, { status: 402 });
    }

    // One payment buys one organization. The reference column is @unique, but
    // checking here returns a message the buyer can act on rather than a raw
    // constraint violation.
    const alreadyUsed = await prisma.subscriptions_info.findUnique({
      where: { reference: payment.reference },
      select: { org: true },
    });
    if (alreadyUsed) {
      return NextResponse.json(
        { message: `That payment has already been used to register ${alreadyUsed.org}.` },
        { status: 409 },
      );
    }

    const { user, maintenance_model } = await addToDb({
      name, email, password, type, category, plan, org, logo, payment,
    });

    // Seed the system preset roles for the new org so they exist as real roles.
    try {
      const { seedPresetRoles } = await import('../_lib/seedRoles');
      // Category-scoped: a company should never be seeded a "lecturer" role.
      await seedPresetRoles(org, category);
    } catch (seedErr) {
      console.error('preset role seeding failed (non-fatal):', seedErr);
    }

    const token = jwt.sign(
      {
        userID: user.id.toString(),
        name: user.name,
        role: user.role,
        org: user.org,
        email: user.email,
        logo: user.image,
        productCategory: user.category,
        productPlan: user.plan,
        maintenance_model: maintenance_model || false,
      },
      getJWTSecret(),
    );

    return NextResponse.json({ message: 'Login successful!', token, status: 200 });
  } catch (err: any) {
    // The pre-check above catches the ordinary case; this catches two signups
    // claiming the same name in the same instant, where only the constraint can
    // decide the winner.
    if (err?.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(',') : String(err.meta?.target ?? '');
      return NextResponse.json(
        {
          message: target.includes('email')
            ? 'That email address is already registered.'
            : 'An organization by that name is already registered. If this is your organization, ask its administrator to add you. Otherwise choose a different name.',
        },
        { status: 409 },
      );
    }
    console.error(err)
    return NextResponse.json({ message: err.message || 'Server Error' }, { status: 500 })
  }
}