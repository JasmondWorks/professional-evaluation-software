/** Resolving one organization's entitlements. SERVER ONLY.
 *
 *  Three things decide whether a request may reach a model, and they compose
 *  rather than replace each other:
 *
 *    1. the product plan — what the organization bought (this file);
 *    2. the role — admin runs models, the engineer enters data (models/access);
 *    3. model_access — which of those the admin switched on for the engineer.
 *
 *  A model is reachable only if all three allow it. This file answers the first
 *  and knows nothing about the other two.
 */

import prisma from '@/app/api/prisma.dev';
import {
  normalizeInstitution,
  normalizePlan,
  type InstitutionType,
  type PlanType,
} from './catalog';
import { orgSubscription } from './subscription';
import {
  ENTITLEMENTS,
  UNGOVERNED_MODELS,
  isEntitlementKey,
  planEntitlements,
  type Entitlement,
  type EntitlementKey,
} from './entitlements';
import type { ModelKey } from '../models/catalog';

export class EntitlementError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

/** Distinct from "your plan does not include this": the plan may well include
 *  it, and renewing restores it. 402 rather than 403 so the client can tell a
 *  billing problem from a permission one without matching on the message. */
export class SubscriptionExpiredError extends EntitlementError {
  constructor() {
    super(
      "Your organization's payment plan has expired. Ask your administrator to renew it.",
      402,
    );
  }
}

/** What a route knows about the caller. The category and plan travel in the
 *  token (productCategory / productPlan); both are optional because a token
 *  signed before those claims existed is still in circulation, and because the
 *  token goes stale the moment a plan is upgraded. The org row settles it in
 *  either case. */
export type PlanViewer = {
  org: string;
  orgId?: string | null;
  productCategory?: string | null;
  productPlan?: string | null;
};

export type ResolvedPlan = {
  institution: InstitutionType;
  plan: PlanType;
  /** False once the subscription has lapsed. Every key is withdrawn, so a
   *  lapsed organization holds nothing regardless of what it bought. */
  subscriptionActive: boolean;
  expiresAt: Date | null;
  /** Every key held: the tier's, plus on-demand grants, plus per-org overrides. */
  keys: Set<EntitlementKey>;
  /** True when the plan had to be guessed because the stored value was not one
   *  of the three tiers. */
  degraded: boolean;
};

/** Read category and plan from the token, falling back to the org row for
 *  anything missing or unrecognised. */
async function identify(viewer: PlanViewer): Promise<{
  orgId: string;
  institution: InstitutionType;
  plan: PlanType;
  maintenanceGranted: boolean;
  degraded: boolean;
}> {
  let institution = normalizeInstitution(viewer.productCategory ?? null);
  let plan = normalizePlan(viewer.productPlan ?? null);

  // maintenance_model is always read from the database rather than the token:
  // it is granted mid-session by /api/maintenance/verify, and the token the
  // caller is holding predates that grant.
  const row = viewer.orgId != null
    ? await prisma.org.findUnique({
        where: { id: viewer.orgId },
        select: { id: true, category: true, plan: true, maintenance_model: true },
      })
    : await prisma.org.findFirst({
        where: { name: viewer.org },
        select: { id: true, category: true, plan: true, maintenance_model: true },
      });

  if (!row) {
    throw new EntitlementError('This organization is not registered.', 404);
  }

  institution ??= normalizeInstitution(row.category);
  plan ??= normalizePlan(row.plan);

  // A plan we cannot recognise is a data problem, not a licence to unlock
  // everything. Fall back to the most restrictive real tier, which still
  // includes every model the document sells at every tier, and say so in the
  // log so the org row can be fixed.
  const degraded = !institution || !plan;
  if (degraded) {
    console.warn(
      `[entitlements] ${viewer.org}: could not resolve ` +
        `category=${JSON.stringify(viewer.productCategory ?? row.category)} ` +
        `plan=${JSON.stringify(viewer.productPlan ?? row.plan)}; treating as ACADEMIC/BASIC.`,
    );
  }

  return {
    orgId: row.id,
    institution: institution ?? 'ACADEMIC',
    plan: plan ?? 'BASIC',
    maintenanceGranted: row.maintenance_model === true,
    degraded,
  };
}

/** Everything this organization may use right now. */
export async function resolveEntitlements(viewer: PlanViewer): Promise<ResolvedPlan> {
  const { orgId, institution, plan, maintenanceGranted, degraded } = await identify(viewer);
  const subscription = await orgSubscription(orgId);

  // A lapsed subscription is not a smaller plan, it is no plan. Returning an
  // empty set here means every model route already guarded refuses without
  // needing its own expiry check, and the UI renders nothing it would then be
  // refused for.
  if (!subscription.active) {
    return {
      institution,
      plan,
      keys: new Set<EntitlementKey>(),
      degraded,
      subscriptionActive: false,
      expiresAt: subscription.expiresAt,
    };
  }

  const keys = new Set<EntitlementKey>(planEntitlements(institution, plan));

  // On-demand keys are not sold with the tier. Maintenance is the only one
  // today, and its grant is the org.maintenance_model flag the payment flow
  // already sets.
  if (maintenanceGranted) {
    for (const e of ENTITLEMENTS) {
      if ((e as Entitlement).onDemand?.includes(institution)) keys.add(e.key);
    }
  }

  // Per-org exceptions last, so they can both add and take away.
  const overrides = await prisma.org_entitlements.findMany({
    where: { org_id: orgId },
    select: { entitlement_key: true, granted: true },
  });
  for (const o of overrides) {
    if (!isEntitlementKey(o.entitlement_key)) continue;
    if (o.granted) keys.add(o.entitlement_key);
    else keys.delete(o.entitlement_key);
  }

  return {
    institution,
    plan,
    keys,
    degraded,
    subscriptionActive: true,
    expiresAt: subscription.expiresAt,
  };
}

/** The models the plan opens. A model opens when any one of its entitlements is
 *  held, because a tier often buys some methods of a model and not others —
 *  the page is reachable and the method is gated inside it. */
export function modelsFor(keys: Set<EntitlementKey>): ModelKey[] {
  // An empty key set means the subscription has lapsed, and the models the
  // product plan does not govern lapse with it — they were never free, just
  // not separately sold.
  if (keys.size === 0) return [];

  const models = new Set<ModelKey>(UNGOVERNED_MODELS);
  for (const e of ENTITLEMENTS) {
    if (keys.has(e.key)) for (const m of e.models) models.add(m);
  }
  return [...models];
}

export async function entitledModels(viewer: PlanViewer): Promise<ModelKey[]> {
  return modelsFor((await resolveEntitlements(viewer)).keys);
}

/** Throw unless the organization's plan includes this key. Use inside a route
 *  for anything finer than a whole model — which stress index, which
 *  operational-staff method. */
export async function assertEntitled(viewer: PlanViewer, key: EntitlementKey): Promise<void> {
  const { keys, subscriptionActive } = await resolveEntitlements(viewer);
  if (keys.has(key)) return;
  if (!subscriptionActive) throw new SubscriptionExpiredError();

  const label = ENTITLEMENTS.find((e) => e.key === key)?.label ?? key;
  throw new EntitlementError(
    `${label} is not included in your organization's plan. Upgrade to use it.`,
  );
}

/** Throw unless the plan opens this model at all. */
export async function assertModelEntitled(viewer: PlanViewer, model: ModelKey): Promise<void> {
  const { keys, subscriptionActive } = await resolveEntitlements(viewer);
  if (modelsFor(keys).includes(model)) return;
  if (!subscriptionActive) throw new SubscriptionExpiredError();

  throw new EntitlementError(
    `This model is not included in your organization's plan. Upgrade to use it.`,
  );
}
