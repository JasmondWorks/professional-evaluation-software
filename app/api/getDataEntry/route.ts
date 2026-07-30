import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev'

import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = jwt.decode(token);
    let userOrg: string | null = null;
    if (typeof user === 'object' && user !== null && 'org' in user) {
        userOrg = (user as { org?: string }).org ?? null;
    }

    if (!userOrg) {
        return NextResponse.json([], { status: 200 });
    }

    // Single source of truth for "staff" is the enrolled roster (pesuser),
    // org-scoped — the SAME basis as the dashboard's employee count. Departments
    // and totals come from the roster (not from stale dept strings scattered
    // across appraisal/stress/userperformance), so counts are consistent
    // everywhere and never double-count across models or past cycles (#12).
    const roster = await prisma.pesuser.findMany({
      where: { org: userOrg },
      select: { name: true, dept: true },
    });

    // Distinct staff who have submitted ANY evaluation for this org.
    const submitterRows: { pesuser_name: string | null }[] = await prisma.$queryRaw`
        SELECT DISTINCT pesuser_name FROM appraisal WHERE org = ${userOrg}
        UNION SELECT DISTINCT pesuser_name FROM stress WHERE org = ${userOrg}
        UNION SELECT DISTINCT pesuser_name FROM userperformance WHERE org = ${userOrg}
    `;
    const submitters = new Set(
      submitterRows.map((r) => r.pesuser_name).filter((n): n is string => !!n),
    );

    // Group the roster by department: total staff + how many have submitted.
    const byDept: Record<string, { total: number; submitted: number }> = {};
    for (const u of roster) {
      const dept = (u.dept && u.dept.trim()) || "Unspecified";
      const g = (byDept[dept] ||= { total: 0, submitted: 0 });
      g.total++;
      if (u.name && submitters.has(u.name)) g.submitted++;
    }

    const result = Object.entries(byDept)
      .map(([dept, g]) => ({
        dept,
        total: g.total,
        submitted: g.submitted,
        // Kept for backward-compat with existing UI (now the roster count).
        total_unique_users: g.total,
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json(result, { status: 200 });

} catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}