import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

import { validateData, resetPasswordSchema, confirmResetSchema, formatZodErrors } from '@/app/lib/validation'

type ResetPasswordRequest = {
  email: string
}

type ConfirmResetRequest = {
  token: string
  newPassword: string
}

// Request password reset (send email with token)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
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

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store token in database (you'll need to add these fields to your schema)
    await prisma.pesuser.update({
      where: { id: user.id },
      data: {
        resettoken: resetToken,
        resettokenexpiry: resetTokenExpiry
      }
    })

    // TODO: Send email with reset link
    // For now, return the token (in production, send via email)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

    // In production, send email here
    console.log('Password reset link:', resetLink)

    return NextResponse.json(
      { 
        message: 'If an account exists with this email, a reset link has been sent',
        status: 200,
        // Remove this in production:
        resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
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

    // Find user with valid token
    const user = await prisma.pesuser.findFirst({
      where: {
        resettoken: token,
        resettokenexpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password and clear reset token
    await prisma.pesuser.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resettoken: null,
        resettokenexpiry: null
      }
    })

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
