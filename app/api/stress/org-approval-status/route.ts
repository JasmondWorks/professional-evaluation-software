// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

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
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    })
    if (!cycle) return NextResponse.json({ active: false, departments: [], faculties: [] })

    const staff = await prisma.pesuser.findMany({
      where: { org },
      select: { name: true, dept: true, faculty_college: true },
    })
    const submissions = await prisma.stress.findMany({
      where: { org, cycle_id: cycle.id, rejected: false },
      select: { pesuser_name: true, hod_approved: true, approved: true },
    })
    const subByName = new Map(submissions.map((s) => [s.pesuser_name, s]))

    // The faculty/Dean tier only exists for ACADEMIC organizations. For any other
    // sector the HOD approval IS the final approval (no forced Dean/Manager gate).
    const orgRecord = await prisma.org.findUnique({ where: { name: org }, select: { category: true } })
    const isAcademic = (orgRecord?.category || '').toLowerCase() === 'academic'

    // Which departments have an HOD, and which faculties have a head — so the
    // admin can be warned where approvals can't happen and offered an override.
    const heads = await prisma.pesuser.findMany({
      where: { org, role: { in: ['hod', 'unit-head'] } },
      select: { role: true, dept: true, faculty_college: true },
    })
    const deptsWithHead = new Set(heads.filter((h) => h.role === 'hod' && h.dept).map((h) => h.dept as string))
    const facultiesWithHead = new Set(
      heads.filter((h) => h.role === 'unit-head' && h.faculty_college).map((h) => h.faculty_college as string),
    )

    const finalOf = (g: { hodApproved: number; approved: number }) =>
      isAcademic ? g.approved : g.hodApproved

    // --- Departments: the base level. ---
    type Agg = { staff: number; submitted: number; hodApproved: number; approved: number; faculty: string }
    const deptGroups: Record<string, Agg> = {}
    for (const u of staff) {
      const key = u.dept || 'Unspecified'
      const g = (deptGroups[key] ||= { staff: 0, submitted: 0, hodApproved: 0, approved: 0, faculty: u.faculty_college || 'Unspecified' })
      g.staff++
      const sub = u.name ? subByName.get(u.name) : undefined
      if (sub) {
        g.submitted++
        if (sub.hod_approved) g.hodApproved++
        if (sub.approved) g.approved++
      }
    }
    const departments = Object.entries(deptGroups)
      .map(([name, g]) => ({
        name,
        staff: g.staff,
        submitted: g.submitted,
        hodApproved: g.hodApproved,
        approved: g.approved,
        pendingEntry: g.staff - g.submitted,
        pendingHod: g.submitted - g.hodApproved,
        pendingApproval: g.submitted - finalOf(g),
        cleared: g.submitted > 0 && finalOf(g) === g.submitted,
        hasHead: deptsWithHead.has(name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    // --- Faculties: a faculty is only "cleared" when EVERY department in it is
    // cleared. Its status therefore can never contradict its departments. ---
    type FAgg = { staff: number; submitted: number; hodApproved: number; approved: number; allDeptsCleared: boolean }
    const facGroups: Record<string, FAgg> = {}
    for (const [, g] of Object.entries(deptGroups)) {
      const fac = g.faculty || 'Unspecified'
      const f = (facGroups[fac] ||= { staff: 0, submitted: 0, hodApproved: 0, approved: 0, allDeptsCleared: true })
      f.staff += g.staff
      f.submitted += g.submitted
      f.hodApproved += g.hodApproved
      f.approved += g.approved
      const deptCleared = g.submitted > 0 && finalOf(g) === g.submitted
      if (!deptCleared) f.allDeptsCleared = false
    }
    const faculties = Object.entries(facGroups)
      .map(([name, f]) => ({
        name,
        staff: f.staff,
        submitted: f.submitted,
        hodApproved: f.hodApproved,
        approved: f.approved,
        pendingEntry: f.staff - f.submitted,
        pendingHod: f.submitted - f.hodApproved,
        pendingApproval: f.submitted - finalOf(f),
        // Cleared only when all its departments are cleared (and it has data).
        cleared: f.allDeptsCleared && f.submitted > 0,
        hasHead: facultiesWithHead.has(name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({
      active: true,
      phase: cycle.phase,
      academic: isAcademic,
      departments,
      faculties,
    })
  } catch (err) {
    console.error('org-approval-status error:', err)
    return NextResponse.json({ error: 'Failed to load approval status' }, { status: 500 })
  }
}
