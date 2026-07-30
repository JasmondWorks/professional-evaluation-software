import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'

// HOD/Dean approves Form 6/7 submissions for their department in the current
// cycle. Pass { userName } to approve one staff member, or omit it to approve
// all pending submissions in the department at once.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {
    roles: ['hod', 'super-admin', 'admin'],
  })
  if (!auth.ok) return auth.response

  const org = auth.user.org
  const dept = auth.user.dept
  const approver = auth.user.name || String(auth.user.userID ?? '')
  if (!org || !dept) {
    return NextResponse.json({ error: 'No department on your account.' }, { status: 400 })
  }

  try {
    const { userName } = await req.json().catch(() => ({}))
    const cycle = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: { created_at: 'desc' },
    })
    if (!cycle) return NextResponse.json({ error: 'No active cycle.' }, { status: 400 })

    // Tier 1: HOD approval. Sets hod_approved; the faculty/division head then
    // signs off (tier 2) on top of this.
    const result = await prisma.stress.updateMany({
      where: {
        org,
        dept,
        cycle_id: cycle.id,
        hod_approved: false,
        ...(userName ? { pesuser_name: userName } : {}),
      },
      data: { hod_approved: true, hod_approved_by: approver, hod_approved_at: new Date() },
    })

    return NextResponse.json({ message: `Approved ${result.count} submission(s).`, approved: result.count })
  } catch (err) {
    console.error('approve error:', err)
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 })
  }
}
