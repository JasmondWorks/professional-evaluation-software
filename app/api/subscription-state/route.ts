// Whether this organization's subscription is still live.
//
// The whole platform closes when it lapses, so every signed-in page asks this
// once on load. It is deliberately cheap: one indexed row, no PayPal call —
// PayPal's answer arrives through the webhook and is already written into
// subscriptions_info.

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { authorize, tokenFromRequest } from '../_lib/authGuard';
import { orgSubscription, RENEWAL_WARNING_DAYS } from '@/app/lib/billing/subscription';
import { isModelAdmin } from '@/app/lib/models/access';

export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const orgId = auth.user?.orgId ?? null;
  if (!orgId) {
    return NextResponse.json(
      { error: 'This account is not attached to an organization.' },
      { status: 403 },
    );
  }

  const state = await orgSubscription(orgId);

  return NextResponse.json({
    active: state.active,
    expiresAt: state.expiresAt?.toISOString() ?? null,
    daysLeft: state.daysLeft,
    // Only the administrator can renew, so only they are shown the way to do
    // it. Everyone else is told who to ask.
    canRenew: isModelAdmin(auth.user?.role),
    warn:
      state.active &&
      state.daysLeft !== null &&
      state.daysLeft <= RENEWAL_WARNING_DAYS,
  });
}
