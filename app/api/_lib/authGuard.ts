// Reusable server-side authorization for API routes.
//
// Client-side gating (sidebar, <Can>) is UX only — it can be bypassed by hitting
// the endpoint directly. Protected routes must verify the JWT and check the
// caller's capability/role here, on the server.
//
//   const auth = authorize(tokenFromRequest(req), { anyOf: ['can_access_employee_data'] });
//   if (!auth.ok) return auth.response;
//   // auth.user is the verified payload (role, org, perms, …)
//
// Admin tiers (super-admin/admin) pass any capability check by default, mirroring
// how the sidebar allow-lists include admins everywhere.

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PermissionKey } from '@/app/components/utils/roles';

const SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

// Platform tiers that bypass capability checks within their org.
const ADMIN_TIERS = ['super-admin', 'admin'];

export type DecodedUser = {
  userID?: string | number;
  role?: string | null;
  org?: string | null;
  email?: string | null;
  perms?: Partial<Record<PermissionKey, true>>;
  [k: string]: any;
};

export function verifyToken(token?: string | null): DecodedUser | null {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET) as DecodedUser;
  } catch {
    return null;
  }
}

// Pull a bearer token from the Authorization header.
export function tokenFromRequest(req: Request): string | null {
  const h = req.headers.get('authorization') || req.headers.get('Authorization');
  return h ? h.replace(/^Bearer\s+/i, '') : null;
}

export type AccessRule = {
  anyOf?: PermissionKey[]; // allowed if the user holds any of these capabilities
  roles?: string[]; // allowed if the user's role is in this list
  allowAdmins?: boolean; // default true: admin/super-admin always pass
};

export function hasAccess(user: DecodedUser | null, rule: AccessRule): boolean {
  if (!user) return false;
  const role = user.role ?? '';
  if ((rule.allowAdmins ?? true) && ADMIN_TIERS.includes(role)) return true;
  if (rule.roles?.includes(role)) return true;
  if (rule.anyOf?.some((k) => user.perms?.[k] === true)) return true;
  return false;
}

export const unauthorized = (msg = 'Unauthorized') =>
  NextResponse.json({ error: msg, status: 401 }, { status: 401 });

export const forbidden = (
  msg = 'You do not have permission to perform this action',
) => NextResponse.json({ error: msg, status: 403 }, { status: 403 });

// Verify + authorize in one call. Returns the verified user on success, or a
// ready-to-return NextResponse on failure.
export function authorize(
  token: string | null | undefined,
  rule: AccessRule,
): { ok: true; user: DecodedUser } | { ok: false; response: NextResponse } {
  const user = verifyToken(token);
  if (!user) return { ok: false, response: unauthorized() };
  if (!hasAccess(user, rule)) return { ok: false, response: forbidden() };
  return { ok: true, user };
}
