// Shared role / permission primitives.
//
// Roles in this system are open-ended: an org admin can create custom roles
// (e.g. "Paginator") that we can't enumerate at build time. So the UI must not
// gate on the role *name* alone — a custom role matches none of the hardcoded
// allow-lists and would otherwise see an empty app. Two mechanisms fix that:
//
//   1. resolveEffectiveRole() maps any unknown role down to a safe baseline
//      ("employee-w"), so a custom-role user always gets the standard employee
//      surface instead of nothing.
//   2. PERMISSION_KEYS are the finite, knowable capabilities (from the
//      `permission` table). Capability checks work for ANY role, preset or
//      custom, and are the preferred way to gate features going forward.

// The roles the app special-cases by name. "super-admin"/"admin" are platform
// tiers we own; the rest are the presets offered by the Add-Employee form.
export const KNOWN_ROLES = [
  'super-admin',
  'admin',
  'lecturer',
  'industrial-engineer',
  'hod',
  'employee-w',
  'auditor',
] as const;

export type KnownRole = (typeof KNOWN_ROLES)[number];

// Baseline surface for anyone whose role we don't recognize (custom roles).
export const FALLBACK_ROLE: KnownRole = 'employee-w';

// Map a raw role string to a role the UI knows how to place. Unknown/custom
// roles fall back to the baseline employee surface (plus any capabilities they
// were explicitly granted — see PERMISSION_KEYS / usePermissions).
export function resolveEffectiveRole(role?: string | null): KnownRole {
  if (role && (KNOWN_ROLES as readonly string[]).includes(role)) {
    return role as KnownRole;
  }
  return FALLBACK_ROLE;
}

// The capabilities stored per user in the `permission` table. These are the
// closed set the UI can safely branch on regardless of role name.
export const PERMISSION_KEYS = [
  'manage_user',
  'access_em',
  'ae_all',
  'ae_sub',
  'ae_sel',
  'define_performance',
  'dp_all',
  'dp_sub',
  'dp_sel',
  'access_hierachy',
  'manage_review',
  'mr_all',
  'mr_sub',
  'mr_sel',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

// Permission columns are stored as text ("on" / null). Compact a raw row into a
// small { key: true } object suitable for embedding in the JWT — only granted
// capabilities are kept, so the token stays lean.
export function compactPermissions(
  row: Partial<Record<PermissionKey, string | null>> | null | undefined,
): Partial<Record<PermissionKey, true>> {
  const out: Partial<Record<PermissionKey, true>> = {};
  if (!row) return out;
  for (const key of PERMISSION_KEYS) {
    if (row[key] === 'on') out[key] = true;
  }
  return out;
}
