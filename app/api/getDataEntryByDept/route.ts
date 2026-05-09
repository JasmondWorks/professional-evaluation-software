import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deptParam = searchParams.get('dept');
  const dept = deptParam ? deptParam.replace('%20', ' ') : null;

  if (!dept) {
    return NextResponse.json({ error: 'Missing department parameter' }, { status: 400 });
  }

  try {
const rawResult: { dept: string; pesuser_name: string }[] = await prisma.$queryRaw`
  SELECT DISTINCT dept, pesuser_name
  FROM (
    SELECT dept, pesuser_name FROM appraisal WHERE dept = ${dept}
    UNION
    SELECT dept, pesuser_name FROM stress WHERE dept = ${dept}
    UNION
    SELECT dept, pesuser_name FROM userperformance WHERE dept = ${dept}
  ) AS unique_users
  ORDER BY pesuser_name;
`;
    console.log( "using dept: ",dept , " \n result: ", rawResult);

    if (rawResult.length === 0) {
      return NextResponse.json({ message: 'No data found for the specified department' }, { status: 404 });
    }

    return NextResponse.json(rawResult, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
