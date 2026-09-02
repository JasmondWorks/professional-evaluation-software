import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { Prisma } from '@prisma/client'
import { authorize, tokenFromRequest } from '../_lib/authGuard'

// A person's own stress submission. The name and department used to arrive in
// the body with nothing checking them, so an unauthenticated POST could write a
// stress score against anyone in any organization. They now come off the
// verified token: you can only submit as yourself.
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { payload } = body;
  const pesuser_name = auth.user.name ? String(auth.user.name) : null;
  const dept = auth.user.dept ? String(auth.user.dept) : null;
  const org = auth.user.org ? String(auth.user.org) : null;
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
      where: { pesuser_name, dept, org },
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
