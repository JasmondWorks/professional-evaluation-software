import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'

// For an HOD/Dean: the roster of their department for the current cycle — who
// has submitted Form 6/7, who is still pending entry, and approval status. Used
// by the approvals screen so the head knows who is yet to enter their data.
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), {
    roles: ['hod', 'super-admin', 'admin'],
  })
  if (!auth.ok) return auth.response

  const org = auth.user.org
  const dept = auth.user.dept
  if (!org || !dept) {
    return NextResponse.json({ error: 'No department on your account.' }, { status: 400 })
  }

  try {
    const cycle = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: { created_at: 'desc' },
    })
    if (!cycle) return NextResponse.json({ active: false, roster: [] })

    // Everyone in the department.
    const staff = await prisma.pesuser.findMany({
      where: { org, dept },
      select: { name: true },
    })

    // Their Form 6/7 submissions for this cycle.
    const submissions = await prisma.stress.findMany({
      where: { org, dept, cycle_id: cycle.id },
      select: { pesuser_name: true, approved: true },
    })
    const byName = new Map(submissions.map((s) => [s.pesuser_name, s]))

    const roster = staff.map((s) => {
      const sub = s.name ? byName.get(s.name) : undefined
      return {
        name: s.name,
        submitted: !!sub,
        approved: !!sub?.approved,
      }
    })

    return NextResponse.json({
      active: true,
      phase: cycle.phase,
      dept,
      counts: {
        staff: roster.length,
        submitted: roster.filter((r) => r.submitted).length,
        approved: roster.filter((r) => r.approved).length,
        pendingEntry: roster.filter((r) => !r.submitted).length,
        pendingApproval: roster.filter((r) => r.submitted && !r.approved).length,
      },
      roster,
    })
  } catch (err) {
    console.error('dept-status error:', err)
    return NextResponse.json({ error: 'Failed to load department status' }, { status: 500 })
  }
}
