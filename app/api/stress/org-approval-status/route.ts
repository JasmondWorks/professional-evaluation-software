import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'

// ESTAB./Personnel (admin) overview: for the current cycle, which departments
// (and faculties) have submitted and been approved, and which are still pending.
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), {})
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  try {
    const cycle = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: { created_at: 'desc' },
    })
    if (!cycle) return NextResponse.json({ active: false, departments: [], faculties: [] })

    const staff = await prisma.pesuser.findMany({
      where: { org },
      select: { name: true, dept: true, faculty_college: true },
    })
    const submissions = await prisma.stress.findMany({
      where: { org, cycle_id: cycle.id },
      select: { pesuser_name: true, hod_approved: true, approved: true },
    })
    const subByName = new Map(submissions.map((s) => [s.pesuser_name, s]))

    // The faculty/Dean tier only exists for ACADEMIC organizations. For any other
    // sector the HOD approval IS the final approval (no forced Dean/Manager gate).
    const orgRecord = await prisma.org.findUnique({ where: { name: org }, select: { category: true } })
    const isAcademic = (orgRecord?.category || '').toLowerCase() === 'academic'

    // Roll up counts by any grouping key, tracking both approval tiers.
    const rollup = (keyOf: (u: (typeof staff)[number]) => string) => {
      const groups: Record<string, { staff: number; submitted: number; hodApproved: number; approved: number }> = {}
      for (const u of staff) {
        const key = keyOf(u) || 'Unspecified'
        const g = (groups[key] ||= { staff: 0, submitted: 0, hodApproved: 0, approved: 0 })
        g.staff++
        const sub = u.name ? subByName.get(u.name) : undefined
        if (sub) {
          g.submitted++
          if (sub.hod_approved) g.hodApproved++
          if (sub.approved) g.approved++
        }
      }
      return Object.entries(groups)
        .map(([name, g]) => {
          // The "final" approval for this org: faculty (academic) or HOD (else).
          const finalApproved = isAcademic ? g.approved : g.hodApproved
          return {
            name,
            ...g,
            pendingEntry: g.staff - g.submitted,
            pendingHod: g.submitted - g.hodApproved,
            // Awaiting the final sign-off required before evaluation.
            pendingApproval: g.submitted - finalApproved,
            // "Cleared" = everyone who submitted has the final approval.
            cleared: g.submitted > 0 && finalApproved === g.submitted,
          }
        })
        .sort((a, b) => a.name.localeCompare(b.name))
    }

    return NextResponse.json({
      active: true,
      phase: cycle.phase,
      academic: isAcademic,
      departments: rollup((u) => u.dept || ''),
      faculties: rollup((u) => u.faculty_college || ''),
    })
  } catch (err) {
    console.error('org-approval-status error:', err)
    return NextResponse.json({ error: 'Failed to load approval status' }, { status: 500 })
  }
}
