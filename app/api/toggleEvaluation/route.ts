import { NextRequest, NextResponse } from 'next/server'
import { getJWTSecret } from '@/app/lib/jwt';
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
      getJWTSecret()
    ) as { org: string; role: string }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const orgName = decoded.org

    // Fetch current evaluation array
    const org = await prisma.org.findUnique({
      where: { name: orgName },
      select: { evaluation: true },
    })

    if (!org) {
      return NextResponse.json({ error: 'Org not found' }, { status: 404 })
    }

    const current: string[] = org.evaluation || []

    let updated: string[]
    if (enabled) {
      updated = current.includes(evaluation_type) ? current : [...current, evaluation_type]
    } else {
      updated = current.filter((e) => e !== evaluation_type)
    }

    await prisma.org.update({
      where: { name: orgName },
      data: { evaluation: updated, updated_at: new Date() },
    })

    return NextResponse.json({ success: true, evaluation: updated })
  } catch (err) {
    console.error('Error toggling evaluation:', err)
    return NextResponse.json({ error: 'Failed to update evaluation' }, { status: 500 })
  }
}
