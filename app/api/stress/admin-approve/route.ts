import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'

// Admin override approval. When a department has no HOD (or a faculty no
// Dean/Manager), normal tiered approval can't happen and the admin would be
// blocked from evaluating forever. This lets the org admin approve a department
// or faculty directly — fully (both tiers) — so the cycle can proceed. Admin /
// super-admin only.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), { roles: ['admin', 'super-admin'] })
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  const approver = auth.user.name || String(auth.user.userID ?? '')
  const { dept, faculty } = await req.json().catch(() => ({}))
  if (!dept && !faculty) {
    return NextResponse.json({ error: 'Specify a department or faculty to approve.' }, { status: 400 })
  }

  try {
    const cycle = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    })
    if (!cycle) return NextResponse.json({ error: 'No active cycle.' }, { status: 400 })

    // Which staff are in scope (a department, or a whole faculty).
    const staff = await prisma.pesuser.findMany({
      where: { org, ...(dept ? { dept } : {}), ...(faculty ? { faculty_college: faculty } : {}) },
      select: { name: true },
    })
    const names = staff.map((s) => s.name).filter((n): n is string => !!n)

    // Approve fully (both tiers) so it clears the evaluation gate.
    const now = new Date()
    const result = await prisma.stress.updateMany({
      where: { org, cycle_id: cycle.id, rejected: false, approved: false, pesuser_name: { in: names } },
      data: {
        hod_approved: true,
        hod_approved_by: approver,
        hod_approved_at: now,
        approved: true,
        approved_by: approver,
        approved_at: now,
      },
    })

    return NextResponse.json({ message: `Approved ${result.count} submission(s).`, approved: result.count })
  } catch (err) {
    console.error('admin-approve error:', err)
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 })
  }
}
