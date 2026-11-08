// Reads the caller's token, so this can never be a static route.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../prisma.dev';
import { tokenFromRequest } from '../../_lib/authGuard';
import { consoleViewer } from '../_scope';

// The platform operators.
//
// This exists because the page that listed them was a server component holding
// a direct `prisma.pesuser.findMany({ where: { role: 'super-admin' } })` with
// no authorization of any kind: no token check in the page, no rule in
// roleAccess, no entry in middleware's matcher. Anyone who requested
// /admin/super — signed in or not — was served every platform operator's name
// and email.
//
// A server component could not have been fixed in place. The access token
// lives in localStorage, not a cookie, so the server never sees it; the only
// thing it can read is the `role` cookie, which the browser sets and anyone can
// forge. Authorization has to happen where the token is actually presented,
// which means an API the client calls with its Authorization header — this one.
//
// Platform tier only. An organization admin reaches `consoleViewer` too, but
// who operates the platform is not their business.
export async function GET(req: NextRequest) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

  if (!auth.viewer.isPlatform) {
    return NextResponse.json(
      { error: 'You do not have permission to perform this action', status: 403 },
      { status: 403 },
    );
  }

  try {
    const admins = await prisma.pesuser.findMany({
      where: { role: 'super-admin' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(admins);
  } catch (err) {
    console.error('super-admins list failed:', err);
    return NextResponse.json({ error: 'Could not load platform operators.' }, { status: 500 });
  }
}
