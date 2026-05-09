import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev'

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const rawResult: { dept: string; total_unique_users: BigInt }[] = await prisma.$queryRaw`
        SELECT dept, COUNT(*) AS total_unique_users
        FROM (
        SELECT DISTINCT dept, pesuser_name FROM appraisal
        UNION
        SELECT DISTINCT dept, pesuser_name FROM stress
        UNION
        SELECT DISTINCT dept, pesuser_name FROM userperformance
        ) AS unique_users
        GROUP BY dept
  `;
  
    console.log(rawResult)

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