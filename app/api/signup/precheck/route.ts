// May this person reach the signup form at all?
//
// An organization is created by buying a plan, never by finding the page. The
// form used to render for anyone who typed the URL, and the payment check
// happened only on submit — so someone could fill in every field, choose a
// password, and be told at the last step that there was no payment. Worse, the
// form itself implied an account was available for the asking.
//
// This answers the same question /api/signup answers on submit, using the same
// verification, before anything is shown. The two must agree: a gate that
// admits someone the server will later refuse is worse than no gate.

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { rateLimit } from '../../_lib/rateLimit';
import {
  findPlan,
  normalizeInstitution,
  normalizePlan,
} from '@/app/lib/billing/catalog';
import { verifyPayment } from '@/app/lib/billing/verify';

export async function POST(req: Request) {
  // Public, and every call costs a round trip to PayPal, so it is a way to
  // probe references as well as to check one.
  const tooMany = rateLimit(req, { key: 'signup-precheck', limit: 10, windowMs: 10 * 60_000 });
  if (tooMany) return tooMany;

  const body = await req.json().catch(() => ({}));
  const institutionType = normalizeInstitution(body?.category ?? null);
  const planName = normalizePlan(body?.plan ?? null);
  const reference = typeof body?.reference === 'string' ? body.reference.trim() : '';

  if (!institutionType || !planName || !findPlan(institutionType, planName)) {
    return NextResponse.json(
      {
        ok: false,
        reason:
          'This signup link is missing the product and plan it was bought for. Use the link from your payment confirmation.',
      },
      { status: 400 },
    );
  }

  // Mirrors /api/signup exactly: with billing unenforced the reference is taken
  // on trust, so the gate must not be stricter than the thing it guards.
  const enforced = process.env.BILLING_ENFORCED !== 'false';

  if (!reference) {
    if (enforced) {
      return NextResponse.json(
        {
          ok: false,
          reason:
            'No payment reference. Follow the link in your payment confirmation, or enter your PayPal reference to continue.',
          needsReference: true,
        },
        { status: 402 },
      );
    }
    return NextResponse.json({ ok: true, enforced, plan: planName, institutionType });
  }

  const result = await verifyPayment(reference, { institutionType, plan: planName });
  if (!result.ok) {
    if (enforced) {
      return NextResponse.json(
        { ok: false, reason: result.reason, needsReference: true },
        { status: 402 },
      );
    }
    return NextResponse.json({ ok: true, enforced, plan: planName, institutionType });
  }

  return NextResponse.json({
    ok: true,
    enforced,
    plan: planName,
    institutionType,
    // Shown back so the buyer can see what they are signing up for, and that
    // the clock started when they paid rather than when they got round to this.
    paidAt: result.payment.paidAt.toISOString(),
    expiresAt: result.payment.expiresAt.toISOString(),
    payerEmail: result.payment.payerEmail,
  });
}
