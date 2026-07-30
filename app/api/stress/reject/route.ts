import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'

// A head sends a staff member's Form 6/7 submission BACK for re-entry, with a
// reason. The submission is marked rejected (so it counts as "not submitted"
// until re-done), any approvals are cleared, and the staff member is notified.
// Scope: HOD → own department; faculty head → own faculty; admin → org.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {
    roles: ['hod', 'unit-head', 'super-admin', 'admin'],
  })
  if (!auth.ok) return auth.response

  const org = auth.user.org
  const role = auth.user.role
  const rejecter = auth.user.name || String(auth.user.userID ?? '')
  const { userName, reason } = await req.json().catch(() => ({}))
  if (!org || !userName || !reason || !String(reason).trim()) {
    return NextResponse.json({ error: 'A staff member and a reason are required.' }, { status: 400 })
  }

  try {
    const target = await prisma.pesuser.findFirst({
      where: { name: userName, org },
      select: { id: true, dept: true, faculty_college: true },
    })
    if (!target) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })

    // Authorization by scope.
    const me = auth.user.name
      ? await prisma.pesuser.findFirst({ where: { name: auth.user.name, org }, select: { dept: true, faculty_college: true } })
      : null
    if (role === 'hod' && target.dept !== me?.dept) {
      return NextResponse.json({ error: 'That submission is outside your department.' }, { status: 403 })
    }
    if (role === 'unit-head' && target.faculty_college !== me?.faculty_college) {
      return NextResponse.json({ error: 'That submission is outside your faculty/division.' }, { status: 403 })
    }

    const cycle = await prisma.stressCycle.findFirst({ where: { org }, orderBy: { created_at: 'desc' } })
    if (!cycle) return NextResponse.json({ error: 'No active cycle.' }, { status: 400 })

    const result = await prisma.stress.updateMany({
      where: { org, cycle_id: cycle.id, pesuser_name: userName, rejected: false },
      data: {
        rejected: true,
        rejection_reason: String(reason).trim(),
        rejected_by: rejecter,
        rejected_at: new Date(),
        // Clear any prior approvals — it's back to square one.
        hod_approved: false,
        hod_approved_by: null,
        hod_approved_at: null,
        approved: false,
        approved_by: null,
        approved_at: null,
      },
    })
    if (result.count === 0) {
      return NextResponse.json({ error: 'No active submission to return for this staff member.' }, { status: 404 })
    }

    // Notify the staff member so they know to re-enter, and why.
    try {
      await prisma.notifications.create({
        data: {
          user_id: target.id,
          org,
          title: 'Stress submission returned',
          message: `Your theme & feeling form was sent back for re-entry. Reason: ${String(reason).trim()}`,
        },
      })
    } catch (e) {
      console.error('reject notify failed:', e)
    }

    return NextResponse.json({ message: 'Submission returned for re-entry.' })
  } catch (err) {
    console.error('reject error:', err)
    return NextResponse.json({ error: 'Failed to return submission' }, { status: 500 })
  }
}
