import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'

// Lists the current heads in the caller's org so the UI can warn BEFORE a role
// is assigned: one Department Lead (hod) per department, one Faculty/Division
// Head (unit-head) per faculty. The server still enforces this — this is UX.
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), { anyOf: ['can_manage_user_roles', 'can_access_employee_data'] })
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  try {
    const heads = await prisma.pesuser.findMany({
      where: { org, role: { in: ['hod', 'unit-head'] } },
      select: { id: true, name: true, role: true, dept: true, faculty_college: true },
    })

    // scope value → { id, name } of whoever heads it.
    const hodByDept: Record<string, { id: number; name: string | null }> = {}
    const unitHeadByFaculty: Record<string, { id: number; name: string | null }> = {}

    for (const h of heads) {
      if (h.role === 'hod' && h.dept) hodByDept[h.dept] = { id: h.id, name: h.name }
      if (h.role === 'unit-head' && h.faculty_college) {
        unitHeadByFaculty[h.faculty_college] = { id: h.id, name: h.name }
      }
    }

    return NextResponse.json({ hodByDept, unitHeadByFaculty })
  } catch (err) {
    console.error('role-heads error:', err)
    return NextResponse.json({ error: 'Failed to load current heads' }, { status: 500 })
  }
}
