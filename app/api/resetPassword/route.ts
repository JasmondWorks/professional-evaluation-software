import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

import { validateData, resetPasswordSchema, confirmResetSchema, formatZodErrors } from '@/app/lib/validation'
import { rateLimit } from '../_lib/rateLimit'
import { sendMail } from '@/app/lib/email'
import {
  consumePasswordToken,
  findPasswordTokenHolder,
  issuePasswordToken,
  passwordLink,
} from '@/app/lib/auth/passwordToken'

type ResetPasswordRequest = {
  email: string
}

type ConfirmResetRequest = {
  token: string
  newPassword: string
}

// Request password reset (send email with token)
// Deliberately public: someone who has lost their password cannot present one.
// The POST leg answers the same way whether or not the address exists, and the
// PUT leg is authenticated by the emailed reset token rather than a session.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // This leg sends mail, so unlimited it is both a guessing oracle and a way
    // to bury somebody's inbox.
    const tooMany =
      rateLimit(request, { key: 'reset', limit: 5, windowMs: 60_000 }) ??
      rateLimit(request, {
        key: 'reset:account',
        limit: 3,
        windowMs: 15 * 60_000,
        subject: typeof body?.email === 'string' ? body.email.toLowerCase() : null,
      })
    if (tooMany) return tooMany
    
    const validation = validateData(resetPasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.errors!) },
        { status: 400 }
      )
    }

    const { email } = validation.data!

    // Find user
    const user = await prisma.pesuser.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account exists with this email, a reset link has been sent', status: 200 },
        { status: 200 }
      )
    }

    // Issued through the shared module: hashed at rest, single use, and the
    // same mechanism the provisioning link uses. The old code stored the raw
    // token in pesuser.resettoken, so a leaked backup was a takeover of every
    // account with one outstanding.
    const { token, expiresAt } = await issuePasswordToken(user.id, 'reset');
    const resetLink = passwordLink(token, 'reset');

    // This is the part that never existed. The previous version built the link
    // and console.logged it behind a "TODO: Send email with reset link", so
    // every person who forgot their password was stranded while the UI told
    // them a link was on the way.
    try {
      await sendMail({
        to: user.email,
        subject: 'Reset your PES password',
        html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;color:#1b1b28;max-width:520px;margin:0 auto;padding:8px">
  <h1 style="font-size:19px;font-weight:600;margin:0 0 6px">Reset your password</h1>
  <p style="font-size:15px;color:#4b4b5c;margin:0 0 22px">
    Hello${user.name ? ' ' + user.name : ''}, use the button below to choose a new password.
  </p>
  <p style="margin:0 0 10px">
    <a href="${resetLink}" style="display:inline-block;background:#322b80;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px">
      Reset password
    </a>
  </p>
  <p style="font-size:13px;color:#6b6b7b;margin:0">
    This link works once and expires on
    ${expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
  </p>
  <p style="font-size:12px;color:#9a9aad;margin:24px 0 0;border-top:1px solid #e6e6ee;padding-top:14px">
    If you did not ask for this, ignore it — your current password still works.
  </p>
</div>`,
      });
    } catch (mailErr) {
      // Logged, not surfaced: a send failure reported to the caller would also
      // confirm the address exists.
      console.error('reset: email failed', mailErr);
    }

    return NextResponse.json(
      {
        message: 'If an account exists with this email, a reset link has been sent',
        status: 200,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}

// Confirm password reset with token
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = validateData(confirmResetSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.errors!) },
        { status: 400 }
      )
    }

    const { token, newPassword } = validation.data!

    // Looked up by hash, through the same module that issued it.
    const holder = await findPasswordTokenHolder(token)

    if (!holder) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Spends the token and clears must_change_password: whatever they were
    // given before, this password is theirs.
    await consumePasswordToken(holder.id, hashedPassword)

    return NextResponse.json(
      { message: 'Password reset successfully', status: 200 },
      { status: 200 }
    )

  } catch (error) {
    console.error('Confirm reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
