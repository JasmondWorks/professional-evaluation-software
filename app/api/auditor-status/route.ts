// Reads the caller's token, so this can never be a static route.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/app/lib/jwt';
import prisma from '../prisma.dev';

// The auditor has no pesuser account (and so no session token) until the
// platform admin approves them, so this is keyed off the same invite-link
// JWT the accept form itself verifies via /api/verify-token — not a signed-in
// session. It only ever returns this one person's own submission.
export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ message: 'Token is required' }, { status: 400 });
    }

    const { email } = jwt.verify(token, getJWTSecret()) as { email: string };

    const row = await prisma.auditor_responses.findUnique({
      where: { email },
      select: { status: true, rejection_reason: true, recognition_consent: true },
    });

    if (!row) {
      return NextResponse.json({ submitted: false });
    }

    return NextResponse.json({
      submitted: true,
      status: row.status,
      rejectionReason: row.rejection_reason,
      recognitionConsent: row.recognition_consent,
    });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ message: 'Invitation has expired' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
