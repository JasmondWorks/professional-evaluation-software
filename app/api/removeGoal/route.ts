import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { token, goalId } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    if (!goalId) {
      return NextResponse.json({ error: 'No goal ID provided' }, { status: 400 })
    }

    // Verify token to ensure the request is authenticated
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret-change-in-production'
    ) as { name: string; userID: number }

    // Delete the goal, scoped to the user so they can only delete their own goals
    await prisma.$executeRawUnsafe(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2',
      Number(goalId),
      String(decoded.userID)
    )

    await prisma.$disconnect()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting goal:', err)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
