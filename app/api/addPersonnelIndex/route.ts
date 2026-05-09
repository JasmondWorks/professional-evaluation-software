import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { jwtDecode } from 'jwt-decode';

function decodeJWT(jwt: string){
  const decoded = jwtDecode<{ org: string, user_id: string, dept: string }>(jwt);
  return decoded;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
  }
  const { payload } = body;
  const value = body[payload];
  console.log('i was hit')
  const token = authHeader.split(' ')[1];
  if (!token) {
    return NextResponse.json({ message: 'Token missing' }, { status: 401 });
  }
  const { org, user_id, dept } = decodeJWT(token);
  console.log({ org, user_id, dept })

  const allowedFields = [
    'productivity',
    'redundancy',
    'utility'
  ];

  if (!payload || value === undefined) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  if (!allowedFields.includes(payload)) {
    return NextResponse.json({ message: 'Invalid payload field' }, { status: 400 });
  }

  try {
    // Check if user appraisal already exists
    const existing = await prisma.$queryRawUnsafe(
      `SELECT * FROM "index" WHERE org = $1`,
      org,
    ) as any[];

    if (existing.length === 0) {
      // Insert new row with only the given field
      await prisma.$executeRawUnsafe(
        `INSERT INTO "index" (org, "${payload}") VALUES ($1, $2)`,
        org,
        value
      );

      return NextResponse.json({ message: 'saved successfully' }, { status: 201 });
    } else {
      // Update the field
      await prisma.$executeRawUnsafe(
        `UPDATE "index" SET "${payload}" = $1 WHERE org = $2`,
        value,
        org
      );

      return NextResponse.json({ message: 'index updated' }, { status: 200 });
    }
  } catch (error) {
     console.error('Prisma query error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
