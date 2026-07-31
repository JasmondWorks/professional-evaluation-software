import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'

// Clears goals that have been overdue for MORE THAN 2 WEEKS, to keep dashboards
// from overloading. Goals are org-wide, so this housekeeping is available to any
// member of the org (staff or admin) and only ever removes long-lapsed goals —
// never active or recently-due ones.
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json().catch(() => ({}))
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let org: string | null = null
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production') as any
      org = decoded?.org ?? null
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

    // The org's members — goals are stored against their user_ids.
    const members = await prisma.pesuser.findMany({ where: { org }, select: { id: true } })
    const ids = members.map((m) => String(m.id))
    if (ids.length === 0) return NextResponse.json({ cleared: 0 })

    const cutoff = new Date(Date.now() - TWO_WEEKS_MS)
    const del = await prisma.goals.deleteMany({
      where: { user_id: { in: ids }, due_date: { lt: cutoff } },
    })

    return NextResponse.json({ cleared: del.count })
  } catch (err) {
    console.error('clearOverdueGoals error:', err)
    return NextResponse.json({ error: 'Failed to clear overdue goals' }, { status: 500 })
  }
}
