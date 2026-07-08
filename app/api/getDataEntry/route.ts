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

    const rawResult: { dept: string; total_unique_users: BigInt }[] = await prisma.$queryRaw`
        SELECT dept, COUNT(*) AS total_unique_users
        FROM (
        SELECT DISTINCT dept, pesuser_name FROM appraisal WHERE org = ${userOrg}
        UNION
        SELECT DISTINCT dept, pesuser_name FROM stress WHERE org = ${userOrg}
        UNION
        SELECT DISTINCT dept, pesuser_name FROM userperformance WHERE org = ${userOrg}
        ) AS unique_users
        GROUP BY dept
        ORDER BY total_unique_users DESC
    `;
  
    const result = rawResult.map((row: any) => ({
        dept: row.dept,
        total_unique_users: Number(row.total_unique_users),
      }));
  
    return NextResponse.json(result, { status: 200 });

} catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}