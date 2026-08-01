import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'

/**
 * API route to get statistics for the dashboard.
 * Returns the count of unique pesuser_name and org across all tables.
*/

export async function POST(req: NextRequest) {
    try {
        const auth = authorize(tokenFromRequest(req), {});
        if (!auth.ok) return auth.response;

        const userOrg = auth.user.org ? String(auth.user.org) : null;

        if (!userOrg) {
            return NextResponse.json({ pesuser_nameCount: 0, organizationCount: 0 });
        }

        // Single source of truth = the enrolled roster (pesuser), org-scoped —
        // the SAME basis as the dashboard's employee count, so staff counts are
        // consistent across the whole app (#12). "submitted" is how many of those
        // staff have entered any evaluation.
        const roster = await prisma.pesuser.findMany({
            where: { org: userOrg },
            select: { name: true, dept: true },
        });
        const staffCount = roster.length;
        const deptCount = new Set(
            roster.map((r) => (r.dept && r.dept.trim()) || "Unspecified"),
        ).size;

        const submitterRows: { pesuser_name: string | null }[] = await prisma.$queryRaw`
            SELECT DISTINCT pesuser_name FROM appraisal WHERE org = ${userOrg}
            UNION SELECT DISTINCT pesuser_name FROM stress WHERE org = ${userOrg}
            UNION SELECT DISTINCT pesuser_name FROM userperformance WHERE org = ${userOrg}
        `;
        const submitterSet = new Set(
            submitterRows.map((r) => r.pesuser_name).filter((n): n is string => !!n),
        );
        const submittedCount = roster.filter((u) => u.name && submitterSet.has(u.name)).length;

        return NextResponse.json({
            staffCount,
            deptCount,
            submittedCount,
            // Backward-compat aliases (now roster-based).
            pesuser_nameCount: staffCount,
            organizationCount: deptCount,
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
