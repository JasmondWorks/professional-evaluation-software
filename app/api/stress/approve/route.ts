import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'
import { notifyFacultyHead } from '../../_lib/notify'

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

    // If the department is now fully HOD-approved, nudge the faculty/division
    // head that it's ready for their sign-off (no-op for non-academic orgs, which
    // have no faculty head).
    const stillAwaitingHod = await prisma.stress.count({
      where: { org, dept, cycle_id: cycle.id, hod_approved: false },
    })
    if (stillAwaitingHod === 0) {
      const anyStaff = await prisma.pesuser.findFirst({
        where: { org, dept },
        select: { faculty_college: true },
      })
      if (anyStaff?.faculty_college) {
        await notifyFacultyHead(
          prisma,
          org,
          anyStaff.faculty_college,
          'Department ready for your approval',
          `The ${dept} department has been fully approved by its HOD and is ready for your sign-off.`,
        )
      }
    }

    return NextResponse.json({ message: `Approved ${result.count} submission(s).`, approved: result.count })
  } catch (err) {
    console.error('approve error:', err)
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 })
  }
}
