// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import bcrypt from 'bcryptjs'
import { validateData, changePasswordSchema, formatZodErrors } from '@/app/lib/validation'
import { authorize, tokenFromRequest } from '../_lib/authGuard'
import { rateLimit } from '../_lib/rateLimit'

// Changing your own password. It knew the current password had to be right, but
// not who was asking, and with no rate limiting that made it a password oracle
// against any address: guess, and the 401 tells you whether you guessed wrong.
// The address now comes off the session, so the only account reachable here is
// the caller's own.
export async function POST(request: NextRequest) {
  const auth = authorize(tokenFromRequest(request), {})
  if (!auth.ok) return auth.response

  // Authenticated, but the reply still says whether the current password was
  // right, so the guessing has to be bounded too.
  const tooMany = rateLimit(request, {
    key: 'change-password',
    limit: 5,
    windowMs: 60_000,
    subject: auth.user.email ? String(auth.user.email) : null,
  })
  if (tooMany) return tooMany

  try {
    const body = await request.json()

    const validation = validateData(changePasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.errors!) },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validation.data!
    const email = auth.user.email ? String(auth.user.email) : null

    if (!email) {
      return NextResponse.json({ error: 'No email on this account' }, { status: 403 })
    }

    // Find user
    const user = await prisma.pesuser.findUnique({
      where: { email },
      select: { id: true, password: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.pesuser.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json(
      { message: 'Password changed successfully', status: 200 },
      { status: 200 }
    )

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
