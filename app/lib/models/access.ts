// Who may reach which model. SERVER ONLY.
//
// Before this, every signed-in member of staff could open every model page and
// call every model route. The client's rule is narrower:
//
//   * the organization admin runs the models and reads the results;
//   * the industrial/production engineer enters data into the models the admin
//     has switched on for them, and never runs an evaluation;
//   * nobody else reaches a model at all.
//
// Access is opt-in: with no row in model_access, the engineer has nothing.

import prisma from '@/app/api/prisma.dev';
import { modelsFor, resolveEntitlements, type PlanViewer } from '@/app/lib/billing/access';
import type { EntitlementKey } from '@/app/lib/billing/entitlements';
import { resolveEffectiveRole } from '@/app/components/utils/roles';
import {
  MODEL_ADMIN_ROLES,
  MODEL_DATA_ENTRY_ROLE,
  MODEL_KEYS,
  ModelKey,
  isModelKey,
} from './catalog';

export class ModelAccessError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

// The category and plan ride along so the guard can ask what the organization
// bought as well as what the caller's role is. Both are optional on the type
// because they are optional claims; the org row fills either gap.
export type ModelViewer = PlanViewer & { orgId: number; org: string; role: string; name?: string | null };

export function isModelAdmin(role: string | null | undefined): boolean {
  return MODEL_ADMIN_ROLES.includes(resolveEffectiveRole(role));
}

function isDataEntryRole(role: string | null | undefined): boolean {
  return resolveEffectiveRole(role) === MODEL_DATA_ENTRY_ROLE;
}

/** Every model key this org has switched on for a role. */
export async function enabledModelsFor(orgId: number, role: string): Promise<ModelKey[]> {
  const rows = await prisma.model_access.findMany({
    where: { org_id: orgId, role: resolveEffectiveRole(role), enabled: true },
    select: { model_key: true },
  });
  return rows.map((r) => r.model_key).filter(isModelKey);
}

/** What the caller themselves may reach, which is what the sidebar and the
 *  models page render from. An admin gets everything. */
export async function accessForViewer(
  viewer: ModelViewer,
): Promise<{
  role: string;
  canRunModels: boolean;
  models: ModelKey[];
  /** The sub-model keys the plan includes, for the parts of a page that are
   *  sold separately — which stress index, which operational-staff method. */
  entitlements: EntitlementKey[];
}> {
  const role = resolveEffectiveRole(viewer.role);

  if (!isModelAdmin(role) && !isDataEntryRole(role)) {
    return { role, canRunModels: false, models: [], entitlements: [] };
  }

  // What the plan opens bounds everything below it: an admin has every role
  // permission there is and still cannot reach a model the organization has
  // not bought.
  const { keys } = await resolveEntitlements(viewer);
  const byPlan = modelsFor(keys);
  const entitlements = [...keys];

  if (isModelAdmin(role)) {
    return {
      role,
      canRunModels: true,
      models: MODEL_KEYS.filter((k) => byPlan.includes(k)),
      entitlements,
    };
  }

  // Data entry only: the engineer saves figures, the admin runs the model.
  const enabled = await enabledModelsFor(viewer.orgId, role);
  return {
    role,
    canRunModels: false,
    models: enabled.filter((k) => byPlan.includes(k)),
    entitlements,
  };
}

/** Throw unless the caller may open this model at all. */
export async function assertModelAccess(viewer: ModelViewer, model: ModelKey): Promise<void> {
  // The plan first, and for everyone. Role decides who inside the organization
  // may use a model; the plan decides whether the organization has it at all,
  // so the admin is subject to it too.
  const { keys } = await resolveEntitlements(viewer);
  if (!modelsFor(keys).includes(model)) {
    throw new ModelAccessError(
      "This model is not included in your organization's plan. Upgrade to use it.",
    );
  }

  if (isModelAdmin(viewer.role)) return;

  if (!isDataEntryRole(viewer.role)) {
    throw new ModelAccessError('The models are only available to the organization administrator.');
  }

  const enabled = await enabledModelsFor(viewer.orgId, viewer.role);
  if (!enabled.includes(model)) {
    throw new ModelAccessError(
      'Your organization administrator has not given your role access to this model.',
    );
  }
}

/** Throw unless the caller may RUN a model — evaluate, release, or download
 *  results. That is the admin's act alone, whatever a role can enter data into. */
export function assertMayRunModels(viewer: ModelViewer): void {
  if (!isModelAdmin(viewer.role)) {
    throw new ModelAccessError(
      'Only the organization administrator can run a model or release its results.',
    );
  }
}

/** The whole grid the admin edits: one row per model, per managed role. */
export async function accessMatrix(orgId: number, role: string = MODEL_DATA_ENTRY_ROLE) {
  const rows = await prisma.model_access.findMany({
    where: { org_id: orgId, role },
    select: { model_key: true, enabled: true, updated_at: true, updated_by: true },
  });
  const byKey = new Map(rows.map((r) => [r.model_key, r]));
  return MODEL_KEYS.map((key) => ({
    key,
    enabled: byKey.get(key)?.enabled ?? false,
    updatedAt: byKey.get(key)?.updated_at?.toISOString() ?? null,
    updatedBy: byKey.get(key)?.updated_by ?? null,
  }));
}

/** Switch one model on or off for a role. Admin only. */
export async function setModelAccess(
  viewer: ModelViewer,
  input: { role?: string; model: string; enabled: boolean },
) {
  if (!isModelAdmin(viewer.role)) {
    throw new ModelAccessError('Only the organization administrator can change model access.');
  }
  if (!isModelKey(input.model)) {
    throw new ModelAccessError(`Unknown model: ${input.model}`, 400);
  }

  const role = resolveEffectiveRole(input.role ?? MODEL_DATA_ENTRY_ROLE);
  if (MODEL_ADMIN_ROLES.includes(role)) {
    // The admin's own access is not a toggle — switching it off would lock the
    // organization out of its own models with no way back in.
    throw new ModelAccessError('The organization administrator always has access.', 400);
  }

  await prisma.model_access.upsert({
    where: { org_id_role_model_key: { org_id: viewer.orgId, role, model_key: input.model } },
    create: {
      org_id: viewer.orgId,
      role,
      model_key: input.model,
      enabled: input.enabled,
      updated_by: viewer.name ?? null,
    },
    update: { enabled: input.enabled, updated_by: viewer.name ?? null, updated_at: new Date() },
  });

  return accessMatrix(viewer.orgId, role);
}
