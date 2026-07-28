import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'

// For a Faculty/Division head (unit-head): the departments in THEIR faculty for
// the current cycle, each with submitted / approved counts — so they can verify
// and sign off the whole unit. The unit comes from the head's own
// pesuser.faculty_college.
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), {
    roles: ['unit-head', 'super-admin', 'admin'],
  })
  if (!auth.ok) return auth.response
  const org = auth.user.org
  const name = auth.user.name

  try {
    const me = name
      ? await prisma.pesuser.findFirst({ where: { name, org: org ?? undefined }, select: { faculty_college: true } })
      : null
    const faculty = me?.faculty_college
    if (!faculty) {
      return NextResponse.json({ error: 'No faculty/division on your account.' }, { status: 400 })
    }

    const cycle = await prisma.stressCycle.findFirst({
      where: { org: org ?? undefined },
      orderBy: { created_at: 'desc' },
    })
    if (!cycle) return NextResponse.json({ active: false, faculty })

    const staff = await prisma.pesuser.findMany({
      where: { org: org ?? undefined, faculty_college: faculty },
      select: { name: true, dept: true },
    })
    const submissions = await prisma.stress.findMany({
      where: { org: org ?? undefined, cycle_id: cycle.id },
      select: { pesuser_name: true, approved: true },
    })
    const subByName = new Map(submissions.map((s) => [s.pesuser_name, s]))

    // Roll up by department within the faculty.
    const byDept: Record<string, { staff: number; submitted: number; approved: number }> = {}
    for (const s of staff) {
      const d = s.dept || 'Unspecified'
      const g = (byDept[d] ||= { staff: 0, submitted: 0, approved: 0 })
      g.staff++
      const sub = s.name ? subByName.get(s.name) : undefined
      if (sub) {
        g.submitted++
        if (sub.approved) g.approved++
      }
    }
    const departments = Object.entries(byDept)
      .map(([dept, g]) => ({
        dept,
        ...g,
        pendingApproval: g.submitted - g.approved,
        cleared: g.submitted > 0 && g.approved === g.submitted,
      }))
      .sort((a, b) => a.dept.localeCompare(b.dept))

    const totals = departments.reduce(
      (t, d) => ({
        staff: t.staff + d.staff,
        submitted: t.submitted + d.submitted,
        approved: t.approved + d.approved,
      }),
      { staff: 0, submitted: 0, approved: 0 },
    )

    return NextResponse.json({ active: true, faculty, departments, counts: { ...totals, pendingApproval: totals.submitted - totals.approved } })
  } catch (err) {
    console.error('faculty-status error:', err)
    return NextResponse.json({ error: 'Failed to load faculty status' }, { status: 500 })
  }
}
