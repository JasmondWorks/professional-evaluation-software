// What each member of staff, and each head, is due under the performance half
// of the motivation scheme.
//
// The template's heading is "To be applied to performance model for both staff
// and H.O.Ds", and until now the software only answered the question in the
// abstract — pick a grade, read the row. This answers it about people: their
// settled performance result, the level it puts them at, and what the action
// scheme says follows.

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';
import { staffPerformance, reportingPeriod } from '@/app/lib/performance/results';
import {
  entitlementFor,
  levelFromPercentage,
  PERIODS,
  type Period,
  type PerformanceLevel,
} from '@/app/lib/motivation/scheme';

const HEAD_ROLES = ['hod', 'unit-head'];

export async function GET(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;
    const org = auth.user?.org ? String(auth.user.org) : null;
    if (!org) {
      return NextResponse.json({ error: 'Organization not found in token' }, { status: 400 });
    }

    const url = new URL(req.url);
    const periodParam = (url.searchParams.get('period') ?? 'annual') as Period;
    const period = PERIODS.some((p) => p.key === periodParam) ? periodParam : 'annual';

    const [reporting, rows, scheme, people] = await Promise.all([
      reportingPeriod(org),
      staffPerformance({ org }),
      prisma.motivation_scheme.findFirst({
        where: { org, active: true },
        orderBy: { created_at: 'desc' },
      }),
      prisma.pesuser.findMany({ where: { org }, select: { name: true, role: true } }),
    ]);

    const roleOf = new Map(people.map((p) => [p.name, p.role ?? '']));
    const adopted = Array.isArray(scheme?.selections) ? (scheme!.selections as string[]) : null;

    const results = rows
      .filter((r) => r.overall != null)
      .map((r) => {
        // The document's own vocabulary. `descriptive` already carries it where
        // the performance model recorded one; the percentage is the fallback so
        // an older row still lands on a level.
        const level = ((r.descriptive as PerformanceLevel | null) ??
          levelFromPercentage(Number(r.overall))) as PerformanceLevel;

        return {
          name: r.pesuser_name,
          dept: r.dept,
          isHead: HEAD_ROLES.includes(roleOf.get(r.pesuser_name) ?? ''),
          overall: r.overall == null ? null : Number(r.overall),
          partial: r.partial,
          level,
          entitlement: entitlementFor(level, period, adopted),
        };
      })
      .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0));

    return NextResponse.json({
      period,
      reportingPeriod: reporting ? { id: reporting.id } : null,
      schemeAdopted: adopted != null,
      staff: results.filter((r) => !r.isHead),
      heads: results.filter((r) => r.isHead),
    });
  } catch (error) {
    console.error('Error working out performance motivation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
