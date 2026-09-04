// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import bcrypt from 'bcryptjs'
import { sendMail } from '@/app/lib/email'
import { authorize, tokenFromRequest } from '../_lib/authGuard'
import { rateLimit } from '../_lib/rateLimit'

const randombytes = require('randombytes')

function generateUniquePassword(length = 8) {
  // Excluded ambiguous characters: l, 1, I, O, 0
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*()'
  const randomBytes = randombytes(length)
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(randomBytes[i] % chars.length))
  }
  return password
}

async function sendLoginEmail(to: string, name: string, password: string) {
  return sendMail({
    to,
    subject: 'Your Login Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1e3a8a;">Hello ${name},</h2>
        <p>Your login credentials have been reset.</p>
        <p><strong>Email:</strong> ${to}</p>
        <p style="margin-bottom: 5px;"><strong>Password:</strong> <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 6px; border: 1px solid #d1d5db; font-family: monospace; font-size: 16px;">${password}</code></p>
        <p style="margin-top: 15px; font-size: 14px; color: #6b7280;"><em>Note: Be careful not to copy any extra spaces before or after the password when pasting.</em></p>
        <p>Please log in and change your password immediately.</p>
      </div>
    `,
  })
}

// Overwrites an account's password with a fresh one and mails it out. With no
// auth this was a remote lockout of anybody whose email address you could guess:
// POST the address, their password is gone and the replacement goes to them.
// Only an admin, and only over their own organization's people.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), { roles: ['super-admin', 'admin'] })
  if (!auth.ok) return auth.response

  // Each call sends mail and destroys a password, so bound it even for an admin.
  const tooMany = rateLimit(req, {
    key: 'resend-credentials',
    limit: 20,
    windowMs: 60 * 60_000,
    subject: auth.user.org ? String(auth.user.org) : null,
  })
  if (tooMany) return tooMany

  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    // Check user exists
    const user = await prisma.pesuser.findUnique({
      where: { email },
      select: { id: true, name: true, org: true },
    })

    // A super-admin operates across organizations; an org admin does not. The
    // reply is the same either way, so the route cannot be used to test which
    // addresses hold accounts elsewhere.
    const callerOrg = auth.user.org ? String(auth.user.org) : null
    const reachable =
      auth.user.role === 'super-admin' || (!!callerOrg && user?.org === callerOrg)

    if (!user || !reachable) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const newPassword = generateUniquePassword()
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in DB
    await prisma.pesuser.update({
      where: { email },
      data: { password: hashedPassword },
    })

    const emailResult = await sendLoginEmail(email, user.name, newPassword)

    if (!emailResult.success) {
      console.warn(`⚠️ EMAIL FAILED for ${email}: ${emailResult.error}. New password (dev): ${newPassword}`);
      // The password WAS reset, but the email didn't go out — surface it as a
      // failure (not a silent success) so the sender isn't misled.
      return NextResponse.json(
        {
          success: false,
          message: `The password was reset, but the email could not be sent: ${emailResult.error || 'unknown error'}.`,
        },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true, message: 'Credentials resent successfully' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
