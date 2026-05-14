import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'

// POST /api/toggleEvaluation
// Body: { token, evaluation_type: 'appraisal' | 'performance' | 'stress', enabled: boolean }
export async function POST(request: NextRequest) {
  try {
    const { token, evaluation_type, enabled } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret-change-in-production'
    ) as { org: string; role: string }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const orgName = decoded.org

    // Fetch current evaluation array
    const result = await prisma.$queryRaw<{ evaluation: string[] }[]>`
      SELECT evaluation FROM org WHERE name = ${orgName} LIMIT 1
    `

    if (!result.length) {
      return NextResponse.json({ error: 'Org not found' }, { status: 404 })
    }

    const current: string[] = result[0].evaluation || []

    let updated: string[]
    if (enabled) {
      updated = current.includes(evaluation_type) ? current : [...current, evaluation_type]
    } else {
      updated = current.filter((e) => e !== evaluation_type)
    }

    await prisma.$executeRaw`
      UPDATE org
      SET evaluation = ${updated},
          updated_at = NOW()
      WHERE name = ${orgName}
    `

    await prisma.$disconnect()

    return NextResponse.json({ success: true, evaluation: updated })
  } catch (err) {
    console.error('Error toggling evaluation:', err)
    return NextResponse.json({ error: 'Failed to update evaluation' }, { status: 500 })
  }
}
