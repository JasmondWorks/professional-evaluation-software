import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'

/**
 * API route to get statistics for the dashboard.
 * Returns the count of unique pesuser_name and org across all tables.
*/

import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = jwt.decode(token);
        let userOrg: string | null = null;
        if (typeof user === 'object' && user !== null && 'org' in user) {
            userOrg = (user as { org?: string }).org ?? null;
        }

        if (!userOrg) {
            return NextResponse.json({ pesuser_nameCount: 0, organizationCount: 0 });
        }

        // Pull names/depts from each table for this org, then dedupe in JS
        // (equivalent to COUNT(DISTINCT ...) across a UNION of the three tables).
        const select = { pesuser_name: true, dept: true } as const;
        const [appraisals, performances, stresses] = await Promise.all([
            prisma.appraisal.findMany({ where: { org: userOrg }, select }),
            prisma.userperformance.findMany({ where: { org: userOrg }, select }),
            prisma.stress.findMany({ where: { org: userOrg }, select }),
        ]);

        const all = [...appraisals, ...performances, ...stresses];
        const pesuser_nameCount = new Set(all.map((r) => r.pesuser_name)).size;
        const organizationCount = new Set(
            all.map((r) => r.dept).filter((d): d is string => Boolean(d)),
        ).size;

        return NextResponse.json({
            pesuser_nameCount,
            organizationCount,
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
