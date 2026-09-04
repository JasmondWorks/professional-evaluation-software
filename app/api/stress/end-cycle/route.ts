// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'
import { notifyOrgStaff } from '../../_lib/notify'

// Authoritatively END the org's current stress cycle (admin only). Closing the
// Form 6/7 window only closes the FORM — the cycle is only "over" when it's
// evaluated OR ended here. Ending marks it evaluated (terminal) so a new cycle
// can be started. Use after evaluating, or to abandon a stuck/unwanted cycle.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {})
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  try {
    const latest = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    })
    if (!latest || latest.phase === 'evaluated') {
      return NextResponse.json({ error: 'There is no active stress cycle to end.' }, { status: 409 })
    }

    await prisma.stressCycle.update({
      where: { id: latest.id },
      data: { phase: 'evaluated' },
    })

    // Let staff know the exercise is closed.
    await notifyOrgStaff(
      prisma,
      org,
      'Stress exercise closed',
      'The current stress exercise has been closed by your organization. Thank you for your participation.',
    )

    return NextResponse.json({ message: 'Stress cycle ended.' })
  } catch (err) {
    console.error('end-cycle error:', err)
    return NextResponse.json({ error: 'Failed to end cycle' }, { status: 500 })
  }
}
