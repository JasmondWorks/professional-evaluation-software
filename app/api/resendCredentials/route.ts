import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import bcrypt from 'bcryptjs'
import { sendMail } from '@/app/lib/email'

const randombytes = require('randombytes')

// Server-side de-dup: ignore a repeat resend for the same email within a short
// window, so a double request (double-click, retry) can't reset the password
// twice and send two emails (one of which then bounces).
const recentResends = new Map<string, number>()
const RESEND_WINDOW_MS = 15000

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
  const { success } = await sendMail({
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
  return success
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    // Drop a duplicate resend that arrives within the window — prevents a second
    // password reset + second email (and the resulting bounce).
    const last = recentResends.get(email)
    console.log(`[resendCredentials] POST email=${email} at=${Date.now()} lastSeen=${last ?? 'none'}`)
    if (last && Date.now() - last < RESEND_WINDOW_MS) {
      console.log(`[resendCredentials] DUPLICATE within window — skipping second reset/email for ${email}`)
      return NextResponse.json({ message: 'Credentials already being resent', status: 200 })
    }
    recentResends.set(email, Date.now())

    // Check user exists
    const user = await prisma.pesuser.findUnique({
      where: { email },
      select: { id: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const newPassword = generateUniquePassword()
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in DB
    await prisma.pesuser.update({
      where: { email },
      data: { password: hashedPassword },
    })

    const emailSent = await sendLoginEmail(email, user.name, newPassword)

    if (!emailSent) {
      console.warn(`⚠️ EMAIL FAILED. Dev Mode: The new password for ${email} is: ${newPassword}`);
      return NextResponse.json(
        { message: 'Password reset successful, but email failed. Check server console for new password.', status: 200 },
        { status: 200 }
      )
    }

    return NextResponse.json({ message: 'Credentials resent successfully', status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
