/** Server-side payment verification. SERVER ONLY.
 *
 *  Nothing in this file may run in the browser: it holds PayPal credentials and
 *  it is the only thing standing between a hand-typed signup URL and a free
 *  premium account. Before this existed, /api/signup wrote status 'success' and
 *  paid_at = now() unconditionally.
 *
 *  The check answers two questions the client asked for:
 *    1. Is the subscription real, paid, and for the plan being claimed?
 *    2. Has the period lapsed? */

import { findPlan, type InstitutionType, type PlanType } from './catalog';

const PAYPAL_BASE =
  process.env.PAYPAL_SANDBOX === 'true'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

export type VerifiedPayment = {
  /** PayPal's subscription id, stored so a second signup with the same payment
   *  is rejected. This is what makes duplicate payments impossible. */
  reference: string;
  institutionType: InstitutionType;
  plan: PlanType;
  /** Cents actually captured. */
  amount: number;
  /** The day the money landed. The subscription counts from here, not from the
   *  day the admin gets round to signing up. */
  paidAt: Date;
  /** When access lapses, taken from PayPal's own next_billing_time where it
   *  gives one, otherwise derived from the plan interval. */
  expiresAt: Date;
  /** The email PayPal has for the payer. */
  payerEmail: string | null;
};

export type VerificationFailure = { ok: false; reason: string };
export type VerificationResult = { ok: true; payment: VerifiedPayment } | VerificationFailure;

async function accessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!id || !secret) throw new Error('PayPal credentials are not configured.');

  const resp = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error('Could not authenticate with PayPal.');
  return json.access_token;
}

/** Statuses that mean the organization is entitled to access right now.
 *  APPROVAL_PENDING is deliberately excluded: approval is not payment. */
const LIVE_STATUSES = new Set(['ACTIVE', 'COMPLETED']);

/** Verify a PayPal subscription id against the plan the signup URL claims.
 *
 *  `claimed` is what the URL says the buyer bought. If PayPal disagrees, the
 *  URL loses. */
export async function verifySubscription(
  subscriptionId: string,
  claimed: { institutionType: InstitutionType; plan: PlanType },
): Promise<VerificationResult> {
  const plan = findPlan(claimed.institutionType, claimed.plan);
  if (!plan) return { ok: false, reason: 'That plan does not exist for this institution type.' };

  let sub: any;
  try {
    const token = await accessToken();
    const resp = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    sub = await resp.json();
    if (!resp.ok) return { ok: false, reason: 'PayPal does not recognise that payment reference.' };
  } catch (err: any) {
    return { ok: false, reason: err.message ?? 'Could not reach PayPal to confirm the payment.' };
  }

  if (!LIVE_STATUSES.has(sub.status)) {
    return { ok: false, reason: `That subscription is ${String(sub.status).toLowerCase()}, not active.` };
  }

  // The plan on the payment must be the plan being claimed. Without this, a
  // buyer could pay for Basic and sign up with ?product_plan=premium.
  if (plan.paypalPlanId && sub.plan_id !== plan.paypalPlanId) {
    return { ok: false, reason: 'That payment was made for a different plan.' };
  }

  const paidAt = sub.billing_info?.last_payment?.time
    ? new Date(sub.billing_info.last_payment.time)
    : sub.start_time
      ? new Date(sub.start_time)
      : new Date();

  // Prefer PayPal's own next billing date. Fall back to the catalogue interval
  // when PayPal gives none (it omits it on a final cycle).
  const expiresAt = sub.billing_info?.next_billing_time
    ? new Date(sub.billing_info.next_billing_time)
    : addInterval(paidAt, plan.interval, plan.intervalCount);

  if (expiresAt.getTime() <= Date.now()) {
    return { ok: false, reason: 'That subscription has expired. Please renew before signing up.' };
  }

  const captured = sub.billing_info?.last_payment?.amount?.value;
  const amount = captured ? Math.round(parseFloat(captured) * 100) : plan.price;

  return {
    ok: true,
    payment: {
      reference: sub.id,
      institutionType: claimed.institutionType,
      plan: claimed.plan,
      amount,
      paidAt,
      expiresAt,
      payerEmail: sub.subscriber?.email_address ?? null,
    },
  };
}

export function addInterval(from: Date, unit: 'YEAR' | 'MONTH', count: number): Date {
  const out = new Date(from);
  if (unit === 'YEAR') out.setFullYear(out.getFullYear() + count);
  else out.setMonth(out.getMonth() + count);
  return out;
}
