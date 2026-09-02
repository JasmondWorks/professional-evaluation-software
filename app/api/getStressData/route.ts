export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'

// Submitters per department. The GROUP BY ran over the whole table, so the
// counts mixed every organization's departments together — and anyone could ask.
export async function GET(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;

  try {
    const rawResult = await prisma.$queryRaw`
      SELECT dept, COUNT(DISTINCT pesuser_name) as total_users
      FROM stress
      WHERE org = ${org}
      GROUP BY dept
    `;
    
    const result = (rawResult as any[]).map(row => ({
      dept: row.dept,
      total_users: Number(row.total_users)
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching stress data:', error);
    return NextResponse.json({ error: 'Failed to fetch stress data' }, { status: 500 });
  }
}
