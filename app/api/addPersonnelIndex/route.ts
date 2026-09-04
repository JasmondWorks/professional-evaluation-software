// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { Prisma } from '@prisma/client'
import { authorize, tokenFromRequest } from '../_lib/authGuard';

// The org, user and department were read with jwtDecode, which does not check
// the signature — so a token typed by hand named whichever org it liked and the
// index was written there. Same three values, off a verified token.
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { payload } = body;
  const value = body[payload];
  const org = auth.user.org ? String(auth.user.org) : null;
  const dept = auth.user.dept ? String(auth.user.dept) : null;

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
