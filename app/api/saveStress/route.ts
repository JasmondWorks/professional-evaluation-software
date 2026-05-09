import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'

export async function POST(req: NextRequest) {

  const body = await req.json();
  const { pesuser_name, dept, payload } = body;
  const value = body[payload];

  const allowedFields = [
    'stress_theme',
    'stress_feeling_frequency',
  ];

  if (!pesuser_name || !payload || value === undefined) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  if (!allowedFields.includes(payload)) {
    return NextResponse.json({ message: 'Invalid payload field' }, { status: 400 });
  }

  try {
    // Check if user stress already exists
    const existing = await prisma.$queryRawUnsafe(
      `SELECT * FROM "stress" WHERE pesuser_name = $1 AND dept = $2`,
      pesuser_name,
      dept
    ) as any[];

    if (existing.length === 0) {
      // Insert new row with only the given field
      await prisma.$executeRawUnsafe(
        `INSERT INTO "stress" (pesuser_name, dept, "${payload}") VALUES ($1, $2, $3)`,
        pesuser_name,
        dept,
        value
      );

      return NextResponse.json({ message: 'stress created' }, { status: 201 });
    } else {
      // Update the field
      await prisma.$executeRawUnsafe(
        `UPDATE "stress" SET "${payload}" = $1 WHERE pesuser_name = $2 AND dept = $3`,
        value,
        pesuser_name,
        dept
      );
      return NextResponse.json({ message: 'stress updated' }, { status: 200 });
    }
  } catch (error) {
    console.error('Prisma query error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
