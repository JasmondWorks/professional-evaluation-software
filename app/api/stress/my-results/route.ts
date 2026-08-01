import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'
import { factors, mean, CategoryValues } from '@/app/lib/stress/scoring'
import { CATEGORY_KEYS } from '@/app/lib/stress/instrument'

// A staff member's view of THEIR OWN department / faculty stress results — only
// returned for the levels the org admin has granted them (view_department_stress
// / view_faculty_stress). Computed from the effective cycle's Form 5 data with
// the same hierarchy the admin evaluation uses (faculty = mean of departments).
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), {})
  if (!auth.ok) return auth.response
  const org = auth.user.org
  const name = auth.user.name
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  try {
    const me = name
      ? await prisma.pesuser.findFirst({
          where: { name, org },
          select: { dept: true, faculty_college: true, view_department_stress: true, view_faculty_stress: true },
        })
      : null
    if (!me) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

    const canDept = !!me.view_department_stress
    const canFaculty = !!me.view_faculty_stress
    if (!canDept && !canFaculty) {
      return NextResponse.json({ allowedDepartment: false, allowedFaculty: false })
    }

    // Effective settings cycle = the latest cycle that actually collected Form 5.
    const withScores = await prisma.stress_scores.findMany({
      where: { org, cycle_id: { not: null } },
      select: { cycle_id: true },
      distinct: ['cycle_id'],
      orderBy: { cycle_id: 'desc' },
    })
    const cycleId = withScores.length ? withScores[0].cycle_id : null

    const rows = await prisma.stress_scores.findMany({
      where: { org, ...(cycleId != null ? { cycle_id: cycleId } : {}) },
    })

    // Per-staff stress factor, then per-department mean.
    const byDept: Record<string, number[]> = {}
    for (const r of rows as any[]) {
      const values = {} as CategoryValues
      for (const k of CATEGORY_KEYS) values[k] = Number(r[k] ?? 0)
      const f = factors(values)
      const dept = r.dept || 'Unspecified'
      ;(byDept[dept] ||= []).push(f.stress)
    }
    const deptStress: Record<string, number> = {}
    for (const [d, arr] of Object.entries(byDept)) deptStress[d] = mean(arr)

    // Which faculty each department belongs to.
    const staff = await prisma.pesuser.findMany({ where: { org }, select: { dept: true, faculty_college: true } })
    const facultyOfDept: Record<string, string> = {}
    for (const s of staff) {
      const d = s.dept || 'Unspecified'
      if (!facultyOfDept[d]) facultyOfDept[d] = s.faculty_college || 'Unspecified'
    }

    const myDept = me.dept || 'Unspecified'
    const myFaculty = me.faculty_college || 'Unspecified'

    // Faculty stress = mean of its departments' values (hierarchical).
    const facultyDeptValues = Object.entries(deptStress)
      .filter(([d]) => (facultyOfDept[d] || 'Unspecified') === myFaculty)
      .map(([, v]) => v)

    return NextResponse.json({
      allowedDepartment: canDept,
      allowedFaculty: canFaculty,
      cycleId,
      department: canDept
        ? { name: myDept, stress: myDept in deptStress ? deptStress[myDept] : null }
        : null,
      faculty: canFaculty
        ? { name: myFaculty, stress: facultyDeptValues.length ? mean(facultyDeptValues) : null }
        : null,
    })
  } catch (err) {
    console.error('my-results error:', err)
    return NextResponse.json({ error: 'Failed to load your stress results' }, { status: 500 })
  }
}
