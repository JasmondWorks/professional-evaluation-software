// Shared role / permission primitives.
//
// Roles are open-ended: an org admin can create custom roles (e.g. "Paginator").
// To keep role-based UI predictable, a custom role is created with a `base_role`
// — one of the system PRESETS below — and employees created with that role get
// the preset written into pesuser.role, while the custom name is kept in
// pesuser.display_role for display. Fine-grained access is then driven by
// PERMISSIONS (a fixed, knowable set), not the role name.

// System preset roles that drive role-based UI. A custom role must map onto one
// of these. "super-admin" is a platform tier (not assignable as a base role).
export const PRESET_ROLES = [
  'admin',
  'hod',
  'lecturer',
  'industrial-engineer',
  'employee-w',
  'auditor',
] as const;

export type PresetRole = (typeof PRESET_ROLES)[number];

// Human-friendly labels for the presets (used in dropdowns).
export const PRESET_ROLE_LABELS: Record<PresetRole, string> = {
  admin: 'Admin',
  hod: 'Department Lead (HOD)',
  lecturer: 'Employee — Academic',
  'industrial-engineer': 'Employee — Non-Academic',
  'employee-w': 'Employee (baseline)',
  auditor: 'Auditor',
};

// All roles the app special-cases by name (presets + platform super-admin).
export const KNOWN_ROLES = ['super-admin', ...PRESET_ROLES] as const;

export type KnownRole = (typeof KNOWN_ROLES)[number];

// Baseline surface for anyone whose role we don't recognize.
export const FALLBACK_ROLE: PresetRole = 'employee-w';

// Map a raw role string to a role the UI knows how to place. With Approach B,
// pesuser.role is always a preset, so this normally passes through unchanged;
// it stays as a safety net for legacy/custom values.
export function resolveEffectiveRole(role?: string | null): KnownRole {
  if (role && (KNOWN_ROLES as readonly string[]).includes(role)) {
    return role as KnownRole;
  }
  return FALLBACK_ROLE;
}

// Normalize an arbitrary base-role choice to a valid preset (defaults to baseline).
export function resolveBaseRole(base?: string | null): PresetRole {
  if (base && (PRESET_ROLES as readonly string[]).includes(base)) {
    return base as PresetRole;
  }
  return FALLBACK_ROLE;
}

// The capabilities stored per user/role in the `permission` table. Descriptive
// names, stored as booleans. This is the closed set the UI can safely branch on
// regardless of role name.
export const PERMISSION_KEYS = [
  'can_manage_user_roles',
  'can_access_employee_data',
  'access_employee_all',
  'access_employee_subordinates',
  'access_employee_selected',
  'can_define_performance_metrics',
  'define_performance_all',
  'define_performance_subordinates',
  'define_performance_selected',
  'can_access_reporting_hierarchy',
  'can_manage_performance_reviews',
  'manage_reviews_all',
  'manage_reviews_subordinates',
  'manage_reviews_selected',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

// Default capability template for each system preset. Used when seeding preset
// roles into a new org so they behave sensibly out of the box (and so the Roles
// table can show/edit their permissions like any custom role). Anything not
// listed defaults to false. These are starting points — an admin can edit them.
export const PRESET_PERMISSION_DEFAULTS: Record<PresetRole, PermissionKey[]> = {
  admin: [...PERMISSION_KEYS], // full access
  hod: [
    'can_access_employee_data',
    'access_employee_subordinates',
    'can_define_performance_metrics',
    'define_performance_subordinates',
    'can_access_reporting_hierarchy',
    'can_manage_performance_reviews',
    'manage_reviews_subordinates',
  ],
  'industrial-engineer': ['can_define_performance_metrics', 'define_performance_all'],
  auditor: ['can_access_employee_data', 'access_employee_all', 'can_manage_performance_reviews', 'manage_reviews_all'],
  lecturer: [], // self-service employee — no management capabilities
  'employee-w': [],
};

// Build a full boolean permission map for a preset from its default list.
export function presetPermissionMap(preset: PresetRole): Record<PermissionKey, boolean> {
  const granted = new Set(PRESET_PERMISSION_DEFAULTS[preset] ?? []);
  return Object.fromEntries(PERMISSION_KEYS.map((k) => [k, granted.has(k)])) as Record<
    PermissionKey,
    boolean
  >;
}

// Compact a raw permission row (boolean columns) into a small { key: true }
// object suitable for embedding in the JWT — only granted capabilities are kept.
export function compactPermissions(
  row: Partial<Record<PermissionKey, boolean | null>> | null | undefined,
): Partial<Record<PermissionKey, true>> {
  const out: Partial<Record<PermissionKey, true>> = {};
  if (!row) return out;
  for (const key of PERMISSION_KEYS) {
    if (row[key] === true) out[key] = true;
  }
  return out;
}
