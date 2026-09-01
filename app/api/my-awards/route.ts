// A member of staff's own awards.
//
// The motivation model itself is an admin surface, and its endpoints return the
// whole organization. The client asked that staff be able to print what they
// have earned, which is not a reason to show them everyone else's grade, so
// this returns one person: whoever holds the token.

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';
import { staffPerformance } from '@/app/lib/performance/results';
import {
  entitlementFor,
  levelFromPercentage,
  PERIODS,
  type Period,
  type PerformanceLevel,
} from '@/app/lib/motivation/scheme';

export async function GET(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;

    const org = auth.user?.org ? String(auth.user.org) : null;
    const email = auth.user?.email ? String(auth.user.email) : null;
    if (!org || !email) {
      return NextResponse.json({ error: 'Sign in again to continue.' }, { status: 400 });
    }

    const me = await prisma.pesuser.findFirst({
      where: { email, org },
      select: { name: true, dept: true },
    });
    if (!me) {
      return NextResponse.json({ error: 'No staff record for this account.' }, { status: 404 });
    }

    const url = new URL(req.url);
    const asked = (url.searchParams.get('period') ?? 'annual') as Period;
    const period = PERIODS.some((p) => p.key === asked) ? asked : 'annual';

    const [rows, scheme, recorded] = await Promise.all([
      staffPerformance({ org, names: [me.name] }),
      prisma.motivation_scheme.findFirst({
        where: { org, active: true },
        orderBy: { created_at: 'desc' },
      }),
      // Anything the admin has already handed over and written down.
      prisma.motivation_award.findMany({
        where: { org, staff_name: me.name },
        orderBy: { awarded_at: 'desc' },
      }),
    ]);

    const mine = rows[0] ?? null;
    const adopted = Array.isArray(scheme?.selections) ? (scheme!.selections as string[]) : null;

    const level =
      mine?.overall == null
        ? null
        : (((mine.descriptive as PerformanceLevel | null) ??
            levelFromPercentage(Number(mine.overall))) as PerformanceLevel);

    return NextResponse.json({
      name: me.name,
      dept: me.dept,
      period,
      overall: mine?.overall == null ? null : Number(mine.overall),
      level,
      entitlement: level ? entitlementFor(level, period, adopted) : null,
      awards: recorded,
    });
  } catch (error) {
    console.error('Error reading own awards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
