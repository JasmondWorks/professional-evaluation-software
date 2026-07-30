import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'

// Returns a single staff member's Form 6/7 submission for the current cycle, so
// a head can SEE what they're approving. Scoped: an HOD may only view their own
// department; a faculty/division head only their faculty; admin any in the org.
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), {
    roles: ['hod', 'unit-head', 'super-admin', 'admin'],
  })
  if (!auth.ok) return auth.response

  const org = auth.user.org
  const role = auth.user.role
  const url = new URL(req.url)
  const name = url.searchParams.get('name')
  if (!org || !name) {
    return NextResponse.json({ error: 'Missing org or name' }, { status: 400 })
  }

  try {
    // The staff member being viewed.
    const target = await prisma.pesuser.findFirst({
      where: { name, org },
      select: { name: true, dept: true, faculty_college: true },
    })
    if (!target) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })

    // Authorization by scope.
    const me = auth.user.name
      ? await prisma.pesuser.findFirst({
          where: { name: auth.user.name, org },
          select: { dept: true, faculty_college: true },
        })
      : null
    if (role === 'hod' && target.dept !== me?.dept) {
      return NextResponse.json({ error: 'That submission is outside your department.' }, { status: 403 })
    }
    if (role === 'unit-head' && target.faculty_college !== me?.faculty_college) {
      return NextResponse.json({ error: 'That submission is outside your faculty/division.' }, { status: 403 })
    }

    const cycle = await prisma.stressCycle.findFirst({ where: { org }, orderBy: { created_at: 'desc' } })
    if (!cycle) return NextResponse.json({ error: 'No active cycle.' }, { status: 400 })

    const row = await prisma.stress.findFirst({
      where: { org, cycle_id: cycle.id, pesuser_name: name },
      select: { assessment_data: true, hod_approved: true, approved: true, dept: true },
    })
    if (!row) return NextResponse.json({ error: 'No submission for this staff member in the current cycle.' }, { status: 404 })

    return NextResponse.json({
      name: target.name,
      dept: row.dept,
      hodApproved: row.hod_approved,
      approved: row.approved,
      assessment: row.assessment_data,
    })
  } catch (err) {
    console.error('submission view error:', err)
    return NextResponse.json({ error: 'Failed to load submission' }, { status: 500 })
  }
}
