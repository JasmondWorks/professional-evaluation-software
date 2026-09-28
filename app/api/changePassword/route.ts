// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.dev'
import bcrypt from 'bcryptjs'
import { validateData, changePasswordSchema, formatZodErrors } from '@/app/lib/validation'
import { authorize, tokenFromRequest } from '../_lib/authGuard'
import { rateLimit } from '../_lib/rateLimit'
import { getJWTSecret } from '@/app/lib/jwt'
import { compactPermissions } from '@/app/components/utils/roles'

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
      select: {
        id: true,
        password: true,
        name: true,
        role: true,
        display_role: true,
        org_id: true,
        dept: true,
        category: true,
        plan: true,
        image: true,
      }
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
      data: {
        password: hashedPassword,
        // They have chosen this one themselves, so there is nothing left to
        // force — this is what releases them from the change-password gate.
        must_change_password: false,
        // Any outstanding set-password or reset link is spent: the account is
        // settled, and a link still sitting in an inbox should not reopen it.
        password_token: null,
        password_token_expiry: null,
        password_token_purpose: null,
      }
    })

    // The old token is still in the browser with mustChangePassword: true baked
    // in, so without a fresh one PasswordGate keeps bouncing them back here
    // until the next unrelated token refresh happens to clear it — which is
    // what made this look intermittent. Issue a token with the updated claim
    // now, the same shape /api/login and /api/refresh build.
    const [org, admin, permissionRow] = await Promise.all([
      user.org_id
        ? prisma.org.findUnique({
            where: { id: user.org_id },
            select: { name: true, logo_url: true, maintenance_model: true },
          })
        : Promise.resolve(null),
      user.org_id
        ? prisma.pesuser.findFirst({
            where: { role: 'admin', org_id: user.org_id },
            select: { image: true },
          })
        : Promise.resolve(null),
      prisma.permission.findFirst({ where: { user_id: String(user.id) } }),
    ])

    const logo = org?.logo_url || admin?.image || user.image || null
    const perms = compactPermissions(permissionRow)

    const accessToken = jwt.sign(
      {
        userID: user.id,
        name: user.name,
        role: user.role,
        displayRole: user.display_role || user.role,
        orgId: user.org_id,
        org: org?.name ?? null,
        email,
        logo,
        dept: user.dept,
        productCategory: user.category,
        productPlan: user.plan,
        maintenance_model: org?.maintenance_model ?? false,
        mustChangePassword: false,
        perms,
      },
      getJWTSecret(),
      { expiresIn: '15m' }
    )

    return NextResponse.json(
      { message: 'Password changed successfully', status: 200, token: accessToken },
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
