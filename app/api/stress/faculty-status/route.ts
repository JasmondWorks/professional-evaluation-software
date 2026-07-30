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
      where: { org: org ?? undefined, cycle_id: cycle.id, rejected: false },
      select: { pesuser_name: true, hod_approved: true, approved: true },
    })
    const subByName = new Map(submissions.map((s) => [s.pesuser_name, s]))

    // Roll up by department within the faculty, tracking BOTH approval tiers:
    // hodApproved (tier 1) and approved (tier 2 = faculty).
    const byDept: Record<string, { staff: number; submitted: number; hodApproved: number; approved: number }> = {}
    for (const s of staff) {
      const d = s.dept || 'Unspecified'
      const g = (byDept[d] ||= { staff: 0, submitted: 0, hodApproved: 0, approved: 0 })
      g.staff++
      const sub = s.name ? subByName.get(s.name) : undefined
      if (sub) {
        g.submitted++
        if (sub.hod_approved) g.hodApproved++
        if (sub.approved) g.approved++
      }
    }
    const departments = Object.entries(byDept)
      .map(([dept, g]) => ({
        dept,
        ...g,
        // Awaiting HOD (tier 1) and awaiting faculty (tier 2, only counts rows
        // already HOD-approved).
        pendingHod: g.submitted - g.hodApproved,
        pendingApproval: g.hodApproved - g.approved,
        // A department is ready for the faculty head once all its submissions are
        // HOD-approved; cleared once all are faculty-approved.
        readyForFaculty: g.submitted > 0 && g.hodApproved === g.submitted,
        cleared: g.submitted > 0 && g.approved === g.submitted,
      }))
      .sort((a, b) => a.dept.localeCompare(b.dept))

    const totals = departments.reduce(
      (t, d) => ({
        staff: t.staff + d.staff,
        submitted: t.submitted + d.submitted,
        hodApproved: t.hodApproved + d.hodApproved,
        approved: t.approved + d.approved,
      }),
      { staff: 0, submitted: 0, hodApproved: 0, approved: 0 },
    )

    // The whole faculty can be signed off only when every submission is
    // HOD-approved first.
    const allHodApproved = totals.submitted > 0 && totals.hodApproved === totals.submitted

    return NextResponse.json({
      active: true,
      faculty,
      departments,
      counts: {
        ...totals,
        pendingHod: totals.submitted - totals.hodApproved,
        // Awaiting the faculty head = HOD-approved but not yet faculty-approved.
        pendingApproval: totals.hodApproved - totals.approved,
        allHodApproved,
      },
    })
  } catch (err) {
    console.error('faculty-status error:', err)
    return NextResponse.json({ error: 'Failed to load faculty status' }, { status: 500 })
  }
}
