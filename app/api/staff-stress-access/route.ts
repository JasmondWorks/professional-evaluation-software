// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'

// The org admin grants/revokes a staff member's read access to their own
// department / faculty stress results. Booleans live on the pesuser record.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), { anyOf: ['can_manage_user_roles'] })
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const { id, email, view_department_stress, view_faculty_stress } = body
  if (!id && !email) {
    return NextResponse.json({ error: 'A staff id or email is required.' }, { status: 400 })
  }

  // Only the fields explicitly provided are changed.
  const data: Record<string, boolean> = {}
  if (typeof view_department_stress === 'boolean') data.view_department_stress = view_department_stress
  if (typeof view_faculty_stress === 'boolean') data.view_faculty_stress = view_faculty_stress
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  try {
    // Scope to the caller's org so an admin can't touch another org's staff.
    const result = await prisma.pesuser.updateMany({
      where: { org, ...(id ? { id: Number(id) } : { email }) },
      data,
    })
    if (result.count === 0) {
      return NextResponse.json({ error: 'Staff member not found in your organization.' }, { status: 404 })
    }
    return NextResponse.json({ success: true, ...data })
  } catch (err) {
    console.error('staff-stress-access error:', err)
    return NextResponse.json({ error: 'Failed to update access' }, { status: 500 })
  }
}
