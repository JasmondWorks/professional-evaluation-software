import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import bcrypt from 'bcrypt'

type ChangePasswordRequest = {
  email: string
  currentPassword: string
  newPassword: string
}

export async function POST(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword }: ChangePasswordRequest = await request.json()

    // Validate input
    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
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
