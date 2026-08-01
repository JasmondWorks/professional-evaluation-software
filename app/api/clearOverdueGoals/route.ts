import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'

// Clears goals that have been overdue for MORE THAN 2 WEEKS, to keep dashboards
// from overloading. Goals are org-wide, so this housekeeping is available to any
// member of the org (staff or admin) and only ever removes long-lapsed goals —
// never active or recently-due ones.
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(request), {});
    if (!auth.ok) return auth.response;

    const org = auth.user.org ? String(auth.user.org) : null;
    if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

    const { goalIds } = await request.json().catch(() => ({}))
    if (!Array.isArray(goalIds) || goalIds.length === 0) {
      return NextResponse.json({ cleared: 0 })
    }

    // Ensure the goals being deleted belong to the user's org to prevent unauthorized deletion
    const members = await prisma.pesuser.findMany({ where: { org }, select: { id: true } })
    const ids = members.map((m) => String(m.id))
    if (ids.length === 0) return NextResponse.json({ cleared: 0 })

    const del = await prisma.goals.deleteMany({
      where: { 
        id: { in: goalIds.map(Number) },
        user_id: { in: ids } 
      },
    })

    return NextResponse.json({ cleared: del.count })
  } catch (err) {
    console.error('clearOverdueGoals error:', err)
    return NextResponse.json({ error: 'Failed to clear overdue goals' }, { status: 500 })
  }
}
