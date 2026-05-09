import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev'

export async function GET(req: NextRequest) {
  try {
    const rawResult = await prisma.$queryRaw`
      SELECT dept, COUNT(DISTINCT pesuser_name) as total_users
      FROM userperformance
      GROUP BY dept
    `;
    
    const result = (rawResult as any[]).map(row => ({
      dept: row.dept,
      total_users: Number(row.total_users)
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
  }
}
