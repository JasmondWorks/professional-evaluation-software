import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { Prisma } from '@prisma/client'
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
  const token = authHeader.split(' ')[1];
  if (!token) {
    return NextResponse.json({ message: 'Token missing' }, { status: 401 });
  }
  const { org, user_id, dept } = decodeJWT(token);

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

  // Only meaningful for the productivity index, and only when the caller sent
  // them. The index is a ratio; keeping the two figures behind it is what lets
  // the future-output prediction fit a line through the history later.
  const resourceFigures =
    payload === 'productivity'
      ? {
          output_resources:
            body.output_resources == null ? null : Number(body.output_resources),
          input_resources:
            body.input_resources == null ? null : Number(body.input_resources),
        }
      : {};

  try {
    // Always create a new record for historical tracking
    await prisma.index.create({
      data: { org, dept, [payload]: value, ...resourceFigures } as Prisma.indexUncheckedCreateInput,
    });

    return NextResponse.json({ message: 'saved successfully' }, { status: 201 });
  } catch (error) {
     console.error('Prisma query error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
