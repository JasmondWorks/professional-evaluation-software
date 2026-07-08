import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

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
    const { email }: ResetPasswordRequest = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

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
    const { token, newPassword }: ConfirmResetRequest = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

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
