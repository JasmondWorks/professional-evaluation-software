export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { verifyToken } from "../_lib/authGuard";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deptParam = searchParams.get('dept');
  const dept = deptParam ? deptParam.replace('%20', ' ') : null;

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  const org = decoded.org;

  if (!dept || !org) {
    return NextResponse.json({ error: 'Missing department or org parameter' }, { status: 400 });
  }

  try {
const rawResult: { dept: string; pesuser_name: string }[] = await prisma.$queryRaw`
  SELECT DISTINCT dept, pesuser_name
  FROM (
    SELECT dept, pesuser_name FROM appraisal WHERE dept = ${dept} AND org = ${org}
    UNION
    SELECT dept, pesuser_name FROM stress WHERE dept = ${dept} AND org = ${org}
    UNION
    SELECT dept, pesuser_name FROM userperformance WHERE dept = ${dept} AND org = ${org}
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
