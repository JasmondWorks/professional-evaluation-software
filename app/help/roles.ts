// Mapping an app role onto the guide's role filter.
//
// Kept in its own module rather than in GuideClient: the sidebar links into
// the guide and needs this, and importing it from the guide component would
// pull all twenty-four sections of prose into the bundle of every page that
// renders a sidebar.

/** The guide groups the eight app roles into the seven it is written for: the
 *  three employee presets read the same chapter. */
const GUIDE_ROLE_FOR: Record<string, string> = {
  'super-admin': 'super-admin',
  admin: 'admin',
  hod: 'hod',
  'dept-admin': 'dept-admin',
  'unit-head': 'unit-head',
  auditor: 'auditor',
  lecturer: 'employee',
  'industrial-engineer': 'employee',
  'employee-w': 'employee',
};

/** Anything unrecognised — a custom role, an empty token — opens the guide
 *  unfiltered rather than filtered to nothing. */
export function guideRoleFor(role?: string | null): string {
  return GUIDE_ROLE_FOR[String(role ?? '')] ?? 'all';
}
