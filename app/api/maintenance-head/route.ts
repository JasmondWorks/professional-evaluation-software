// Does this organization have a maintenance head?
//
// The maintenance model is the maintenance team's to run, and the organization
// admin is specifically excluded from executing it. An organization that has
// not appointed a head therefore has nobody who can, which everyone involved
// should be told plainly rather than discovering by finding no buttons.

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';
import { MAINTENANCE_HEAD_ROLE } from '@/app/lib/maintenance/team';

export async function GET(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;
    const org = auth.user?.org ? String(auth.user.org) : null;
    if (!org) {
      return NextResponse.json({ error: 'Organization not found in token' }, { status: 400 });
    }

    const heads = await prisma.pesuser.findMany({
      where: { org, role: MAINTENANCE_HEAD_ROLE },
      select: { name: true, dept: true },
      take: 10,
    });

    return NextResponse.json({ heads, hasHead: heads.length > 0 });
  } catch (error) {
    console.error('Error checking for a maintenance head:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
