import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { Prisma } from '@prisma/client'

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
    const existing = await prisma.stress.findFirst({
      where: { pesuser_name, dept },
    });

    // `payload` is validated against allowedFields above, so the dynamic key is safe.
    if (!existing) {
      await prisma.stress.create({
        data: { pesuser_name, dept, [payload]: value } as Prisma.stressUncheckedCreateInput,
      });

      return NextResponse.json({ message: 'stress created' }, { status: 201 });
    } else {
      await prisma.stress.updateMany({
        where: { pesuser_name, dept },
        data: { [payload]: value } as Prisma.stressUncheckedUpdateManyInput,
      });
      return NextResponse.json({ message: 'stress updated' }, { status: 200 });
    }
  } catch (error) {
    console.error('Prisma query error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
