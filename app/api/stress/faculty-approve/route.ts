import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'

// A Faculty/Division head approves Form 6/7 submissions for their whole unit in
// the current cycle. Pass { dept } to approve just one department within the
// faculty, or omit it to approve every pending submission in the faculty.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {
    roles: ['unit-head', 'super-admin', 'admin'],
  })
  if (!auth.ok) return auth.response
  const org = auth.user.org
  const approver = auth.user.name || String(auth.user.userID ?? '')

  try {
    const me = auth.user.name
      ? await prisma.pesuser.findFirst({ where: { name: auth.user.name, org: org ?? undefined }, select: { faculty_college: true } })
      : null
    const faculty = me?.faculty_college
    if (!faculty) return NextResponse.json({ error: 'No faculty/division on your account.' }, { status: 400 })

    const { dept } = await req.json().catch(() => ({}))
    const cycle = await prisma.stressCycle.findFirst({
      where: { org: org ?? undefined },
      orderBy: { created_at: 'desc' },
    })
    if (!cycle) return NextResponse.json({ error: 'No active cycle.' }, { status: 400 })

    // Which staff are in this faculty (optionally a single department).
    const staff = await prisma.pesuser.findMany({
      where: { org: org ?? undefined, faculty_college: faculty, ...(dept ? { dept } : {}) },
      select: { name: true },
    })
    const names = staff.map((s) => s.name).filter((n): n is string => !!n)

    const result = await prisma.stress.updateMany({
      where: { org: org ?? undefined, cycle_id: cycle.id, approved: false, pesuser_name: { in: names } },
      data: { approved: true, approved_by: approver, approved_at: new Date() },
    })

    return NextResponse.json({ message: `Approved ${result.count} submission(s).`, approved: result.count })
  } catch (err) {
    console.error('faculty-approve error:', err)
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 })
  }
}
