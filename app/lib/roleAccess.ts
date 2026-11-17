// Single source of truth for which signed-in role may reach which route,
// enforced in middleware.ts (see that file for the matching rules). Previously
// this lived only in the sidebar (what's shown) and a second, drifted copy in
// components/utils/tabs.tsx (what a handful of routes checked) — most routes
// under app/(admin) had no server-side gate at all and were reachable by
// anyone who knew the URL. This is the only list now; the sidebar renders its
// nav from PRESET_ROLES + KNOWN_ROLES, and middleware.ts checks pathnames
// against it directly.
//
// Institution type (academic / company / public) does not change this map: it
// changes which roles exist in a given org (e.g. "lecturer" is never assigned
// outside an academic org) and what a role is labelled, not what a role that
// does exist may reach. See app/lib/orgTerms.ts for the labelling.
//
// Ordering within ROUTE_ACCESS does not matter — middleware.ts matches by
// longest prefix, so a narrower rule (e.g. "/appraisal/templates") always
// wins over a broader one it sits inside (e.g. "/appraisal") regardless of
// where either is declared here.

import type { KnownRole } from '@/app/components/utils/roles';

export type RouteRule = {
  path: string;
  roles: KnownRole[];
};

// Routes every signed-in role may reach, whatever their role. Kept separate so
// each entry below stays about what's role-specific.
const EVERYONE: KnownRole[] = [
  'super-admin',
  'admin',
  'hod',
  'dept-admin',
  'unit-head',
  'lecturer',
  'industrial-engineer',
  'employee-w',
  'auditor',
];

export const ROUTE_ACCESS: RouteRule[] = [
  // Universal account pages.
  { path: '/dashboard', roles: EVERYONE },
  { path: '/profile', roles: EVERYONE },
  { path: '/change-password', roles: EVERYONE },
  { path: '/unauthorized', roles: EVERYONE },

  // Organization directory and roles.
  { path: '/em-database/create-role', roles: ['admin'] },
  // Browse + select from the platform's publicly-recognized auditors — org
  // admins no longer invite auditors directly (see /admin/auditors/invite).
  { path: '/em-database/add-auditor', roles: ['admin'] },
  { path: '/em-database', roles: ['admin', 'hod', 'unit-head'] },
  { path: '/organization', roles: ['admin'] },
  { path: '/organizations', roles: ['super-admin'] },
  // Platform-only: inviting an auditor into the recognition pipeline.
  { path: '/admin/auditors/invite', roles: ['super-admin'] },
  { path: '/admin/auditors', roles: ['admin', 'super-admin'] },
  // The cross-org auditor overview (grouped by organization) — platform
  // operator only, matching the sidebar's role_access for this tab.
  { path: '/admin/auditor', roles: ['super-admin'] },
  // The legacy console. These pages had no rule at all and no matcher entry,
  // so any signed-in account reached them; /admin/super needed no account at
  // all. The cookie these rules read is browser-set and forgeable, so this is
  // a second line only — each page and API authorizes the bearer token too.
  { path: '/admin/super', roles: ['super-admin'] },
  // The same list, in the main shell. /admin/super redirects here.
  { path: '/platform-operators', roles: ['super-admin'] },
  // The same roster, in the main shell. /admin/auditor redirects here.
  { path: '/external-auditors', roles: ['super-admin'] },

  // Goals.
  { path: '/goals', roles: ['admin', 'lecturer', 'industrial-engineer', 'hod', 'unit-head', 'employee-w'] },

  // Data entry. /data-entry/students is dept-admin only — the departmental
  // administrator assigned to that department, not every HOD (client, 26 Sep).
  { path: '/data-entry/students', roles: ['dept-admin'] },
  {
    path: '/data-entry',
    roles: ['lecturer', 'industrial-engineer', 'hod', 'dept-admin', 'unit-head', 'employee-w', 'auditor'],
  },

  // Appraisal. Templates (the scheme itself) are the admin's; entries, courses,
  // printing and the auditor queue are staff-side.
  { path: '/appraisal/templates', roles: ['admin'] },
  { path: '/appraisal/approvals', roles: ['unit-head'] },
  { path: '/appraisal/auditor', roles: ['auditor'] },
  {
    path: '/appraisal',
    roles: ['lecturer', 'industrial-engineer', 'hod', 'dept-admin', 'unit-head', 'employee-w', 'auditor'],
  },
  { path: '/completed-appraisals', roles: ['admin', 'hod', 'unit-head', 'auditor'] },

  // Performance. Review (HOD/unit-head), scoring your own head (staff), and
  // the auditor's queue are three different screens under one prefix.
  { path: '/performance/review', roles: ['hod', 'unit-head'] },
  { path: '/performance/score-head', roles: ['lecturer', 'industrial-engineer', 'dept-admin', 'employee-w'] },
  { path: '/performance/auditor', roles: ['auditor'] },
  { path: '/performance', roles: ['lecturer', 'industrial-engineer', 'hod', 'unit-head', 'employee-w'] },

  // Staff Determination — defining performance metrics.
  { path: '/evaluation', roles: ['admin', 'industrial-engineer'] },

  // Assessment (schedules performance review meetings).
  { path: '/assessment', roles: ['admin'] },

  // Models are the admin's to run; the engineer reaches them for data entry
  // only, gated further per-model by whether the admin switched it on.
  { path: '/models', roles: ['admin', 'industrial-engineer'] },
  { path: '/model-access', roles: ['admin'] },

  // Maintenance runs at the production floor, not from the admin's desk — every
  // operating role reaches it, including the admin as a fallback (client, 1
  // September).
  {
    path: '/maintenance',
    roles: ['lecturer', 'industrial-engineer', 'hod', 'unit-head', 'dept-admin', 'employee-w', 'auditor', 'admin'],
  },
  { path: '/maintenance-payment', roles: ['admin'] },

  // Billing.
  { path: '/pricing', roles: ['admin'] },

  // The hub over Organization / Model access / Plan and billing. Gated to the
  // same tier as the screens it links to, so it cannot advertise a destination
  // the caller would be redirected away from.
  { path: '/settings', roles: ['admin'] },

  // Awards — read-only recognition screen, open to everyone who is scored.
  { path: '/my-awards', roles: ['lecturer', 'industrial-engineer', 'hod', 'unit-head', 'employee-w', 'dept-admin', 'auditor'] },

  // Recognition: the Hall of Fame, both Books of Records, and a single award
  // opened from any of them. Read-only and open to everyone in the
  // organization — the whole point of the client's "beautifully designed"
  // books is that staff can see who is in them. The APIs behind these are
  // org-scoped, so a reader only ever sees their own organization's records.
  //
  // These had no rule at all and were absent from middleware's matcher, so
  // they were ungated: reachable by any signed-in account, of any role, from
  // any organization. The data is not sensitive, but "no rule" was an
  // oversight rather than a decision.
  // The hub that replaced the three Recognition rail items.
  { path: '/recognition', roles: EVERYONE },
  { path: '/hall-of-fame', roles: EVERYONE },
  { path: '/book-of-record', roles: EVERYONE },
  { path: '/reward', roles: EVERYONE },
];

// The same rules, inverted: for each role, the route prefixes it may reach.
// Built from ROUTE_ACCESS so the two can never drift apart — this is the
// "role -> routes" shape; ROUTE_ACCESS above is what middleware.ts actually
// matches against (longest-prefix-wins needs the route-keyed form).
export const ROLE_ROUTE_MAP: Record<KnownRole, string[]> = EVERYONE.reduce(
  (acc, role) => {
    acc[role] = ROUTE_ACCESS.filter((rule) => rule.roles.includes(role)).map((rule) => rule.path);
    return acc;
  },
  {} as Record<KnownRole, string[]>,
);

// Public routes: no session required, and not subject to any role check.
// (Marketing pages, auth screens, the help center, external survey forms.)
export const PUBLIC_ROUTES = ['/', '/signup', '/login', '/help', '/surveys'];

/** Longest-prefix match against ROUTE_ACCESS. A route with no rule at all is
 *  not gated here (e.g. a route intentionally left off this list) — callers
 *  should treat "no rule" and "role not permitted" differently. */
export function findRouteRule(pathname: string): RouteRule | null {
  const matches = ROUTE_ACCESS.filter(
    (rule) => pathname === rule.path || pathname.startsWith(rule.path + '/'),
  );
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.path.length - a.path.length)[0];
}
