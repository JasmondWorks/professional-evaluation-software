// Product plan enforcement for API routes.
//
// authGuard answers "may this person do this?"; this answers "did this
// organization buy this?". They are independent — an admin holds every role
// permission there is and still cannot use a model their tier does not include
// — so a protected model route needs both:
//
//   const auth = authorize(tokenFromRequest(req), { roles: ['admin'] });
//   if (!auth.ok) return auth.response;
//   const plan = await requireEntitlement(auth.user, 'stress.conflict');
//   if (!plan.ok) return plan.response;
//
// Client-side gating (useModelAccess, the models layout) is UX only. The
// document's matrix is a commercial boundary, so it is enforced here.

import { NextResponse } from 'next/server';
import {
  EntitlementError,
  assertEntitled,
  assertModelEntitled,
  type PlanViewer,
} from '@/app/lib/billing/access';
import type { EntitlementKey } from '@/app/lib/billing/entitlements';
import type { ModelKey } from '@/app/lib/models/catalog';
import type { DecodedUser } from './authGuard';

export type PlanGuardResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

/** The claims the plan lookup needs. The org row fills in whatever the token
 *  is missing, including a plan upgraded after the token was signed. */
export function planViewer(user: DecodedUser | null): PlanViewer | null {
  if (!user?.org) return null;
  return {
    org: user.org,
    productCategory: user.productCategory ?? user.category ?? null,
    productPlan: user.productPlan ?? user.plan ?? null,
  };
}

function refuse(err: unknown): PlanGuardResult {
  if (err instanceof EntitlementError) {
    return { ok: false, response: NextResponse.json({ error: err.message }, { status: err.status }) };
  }
  console.error('plan guard error:', err);
  return {
    ok: false,
    response: NextResponse.json({ error: 'Could not check your plan. Try again.' }, { status: 500 }),
  };
}

/** Require one sub-model key — a particular stress index, a particular
 *  operational-staff method. */
export async function requireEntitlement(
  user: DecodedUser | null,
  key: EntitlementKey,
): Promise<PlanGuardResult> {
  const viewer = planViewer(user);
  if (!viewer) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'This account is not attached to an organization.' },
        { status: 403 },
      ),
    };
  }
  try {
    await assertEntitled(viewer, key);
    return { ok: true };
  } catch (err) {
    return refuse(err);
  }
}

/** Require that the plan opens a whole model, for routes that are not split
 *  into separately-sold methods. */
export async function requireModel(
  user: DecodedUser | null,
  model: ModelKey,
): Promise<PlanGuardResult> {
  const viewer = planViewer(user);
  if (!viewer) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'This account is not attached to an organization.' },
        { status: 403 },
      ),
    };
  }
  try {
    await assertModelEntitled(viewer, model);
    return { ok: true };
  } catch (err) {
    return refuse(err);
  }
}
