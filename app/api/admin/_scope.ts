// Who the platform console is allowed to answer about.
//
// Two tiers reach these routes and they mean different things. "super-admin" is
// the platform operator and legitimately sees every organization. "admin" is an
// ORGANIZATION admin — one tenant — and the bug these routes carried was that
// they could not tell the two apart, because they asked for no token at all.
//
// Gating the lot to super-admin would have been correct and useless: no account
// holds that tier yet, so the console would answer 403 to everybody. Instead the
// org admin keeps the console, scoped to their own org, and only the operator
// sees across tenants.

import { NextResponse } from 'next/server';
import { verifyToken, unauthorized, forbidden, DecodedUser } from '../_lib/authGuard';

const PLATFORM_TIER = 'super-admin';
const CONSOLE_TIERS = [PLATFORM_TIER, 'admin'];

export type ConsoleViewer = {
  user: DecodedUser;
  /** True for the platform operator: may read across organizations. */
  isPlatform: boolean;
  /** The org an org-admin is confined to; null for the platform operator. */
  org: string | null;
};

export function consoleViewer(
  token: string | null | undefined,
): { ok: true; viewer: ConsoleViewer } | { ok: false; response: NextResponse } {
  const user = verifyToken(token);
  if (!user) return { ok: false, response: unauthorized() };

  const role = user.role ?? '';
  if (!CONSOLE_TIERS.includes(role)) return { ok: false, response: forbidden() };

  const isPlatform = role === PLATFORM_TIER;

  // An org admin whose token carries no org has nothing it can safely be scoped
  // to, so it gets nothing rather than everything.
  const org = isPlatform ? null : user.org ? String(user.org) : null;
  if (!isPlatform && !org) {
    return {
      ok: false,
      response: forbidden('This account is not attached to an organization'),
    };
  }

  return { ok: true, viewer: { user, isPlatform, org } };
}

/** Refuse an org named in the URL that is not the caller's own. */
export function canReachOrg(viewer: ConsoleViewer, org: string): boolean {
  return viewer.isPlatform || viewer.org === org;
}

// Columns of `pesuser` that may leave the API. Named explicitly because the
// alternative — findMany() with no select — served the password hash.
export const PUBLIC_USER_COLUMNS = {
  id: true,
  name: true,
  email: true,
  role: true,
  display_role: true,
  org: true,
  dept: true,
  gsm: true,
  address: true,
  image: true,
  level: true,
  post: true,
  audit_count: true,
} as const;
