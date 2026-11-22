/** Issue the same access/refresh token pair `/api/login` and `/api/refresh`
 *  sign, for a flow that already knows WHICH account it's for without a
 *  password check — right now just /api/password/set, where finishing setup
 *  should sign the person straight in rather than sending them to /login to
 *  do it again (and risk that page's "already signed in" shortcut handing
 *  them whatever OTHER account happens to still be in this browser). SERVER
 *  ONLY. */

import jwt from 'jsonwebtoken';
import { getJWTSecret, getRefreshSecret } from '@/app/lib/jwt';
import prisma from '@/app/api/prisma.dev';
import { compactPermissions } from '@/app/components/utils/roles';

export type SessionTokens = { accessToken: string; refreshToken: string; role: string | null };

export async function issueSessionTokens(userId: string): Promise<SessionTokens | null> {
  const user = await prisma.pesuser.findUnique({ where: { id: userId } });
  if (!user) return null;

  const admin = await prisma.pesuser.findFirst({
    where: { role: 'admin', org_id: user.org_id },
    select: { image: true },
  });
  const org = user.org_id
    ? await prisma.org.findUnique({
        where: { id: user.org_id },
        select: { name: true, logo_url: true, maintenance_model: true },
      })
    : null;
  const logo = org?.logo_url || admin?.image || user.image || null;
  const permissionRow = await prisma.permission.findFirst({ where: { user_id: String(user.id) } });
  const perms = compactPermissions(permissionRow);

  const payload = {
    userID: user.id,
    name: user.name,
    role: user.role,
    displayRole: user.display_role || user.role,
    orgId: user.org_id,
    org: org?.name ?? null,
    email: user.email,
    logo,
    dept: user.dept,
    productCategory: user.category,
    productPlan: user.plan,
    maintenance_model: org?.maintenance_model ?? false,
    mustChangePassword: user.must_change_password === true,
    perms,
  };

  const accessToken = jwt.sign(payload, getJWTSecret(), { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userID: user.id }, getRefreshSecret(), { expiresIn: '1d' });

  return { accessToken, refreshToken, role: user.role };
}
