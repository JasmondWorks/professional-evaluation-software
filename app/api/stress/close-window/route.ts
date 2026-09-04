// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'
import { effectivePhase } from '../../_lib/stressCycle'

// Manually close the CURRENT open form window early (admin), regardless of its
// scheduled end date. settings_open → settings_closed (stop Form 5);
// feeling_open → feeling_closed (stop Form 6/7). The scheduled close date is
// also set to now so the record reflects the real close time.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {})
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  try {
    const cycle = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    })
    if (!cycle) return NextResponse.json({ error: 'No active cycle.' }, { status: 400 })

    const now = new Date()
    const eff = effectivePhase(cycle)

    if (eff === 'settings_open') {
      await prisma.stressCycle.update({
        where: { id: cycle.id },
        data: { phase: 'settings_closed', settings_closes_at: now },
      })
      return NextResponse.json({ message: 'Form 5 (stress category) is now closed. Run the setting when ready.' })
    }

    if (eff === 'feeling_open') {
      await prisma.stressCycle.update({
        where: { id: cycle.id },
        data: { phase: 'feeling_closed', feeling_closes_at: now },
      })
      return NextResponse.json({ message: 'Form 6/7 (themes & feeling) is now closed. Evaluate when ready.' })
    }

    return NextResponse.json({ error: 'There is no open form window to close.' }, { status: 400 })
  } catch (err) {
    console.error('close-window error:', err)
    return NextResponse.json({ error: 'Failed to close window' }, { status: 500 })
  }
}
