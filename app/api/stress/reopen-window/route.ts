import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'
import { effectivePhase } from '../../_lib/stressCycle'

// Reopen a CLOSED form window (admin) — whether it was closed early or by its end
// date. settings_closed → settings_open, feeling_closed → feeling_open. Pass an
// optional { closesAt } to set a new end date; omit it to leave the window
// open-ended (until the admin closes it again).
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {})
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  try {
    const body = await req.json().catch(() => ({}))
    const closesAt = body.closesAt ? new Date(body.closesAt) : null

    const cycle = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    })
    if (!cycle) return NextResponse.json({ error: 'No active cycle.' }, { status: 400 })

    const eff = effectivePhase(cycle)

    if (eff === 'settings_closed') {
      // Reopening settings is only safe before the setting has been computed.
      if (cycle.category_limits) {
        return NextResponse.json(
          { error: 'The setting has already been computed from Form 5, so it can no longer be reopened. Start a new cycle instead.' },
          { status: 400 },
        )
      }
      await prisma.stressCycle.update({
        where: { id: cycle.id },
        data: { phase: 'settings_open', settings_closes_at: closesAt },
      })
      return NextResponse.json({ message: 'Form 5 (stress category) has been reopened.' })
    }

    if (eff === 'feeling_closed') {
      await prisma.stressCycle.update({
        where: { id: cycle.id },
        data: { phase: 'feeling_open', feeling_closes_at: closesAt },
      })
      return NextResponse.json({ message: 'Form 6/7 (themes & feeling) has been reopened.' })
    }

    return NextResponse.json({ error: 'There is no closed form window to reopen.' }, { status: 400 })
  } catch (err) {
    console.error('reopen-window error:', err)
    return NextResponse.json({ error: 'Failed to reopen window' }, { status: 500 })
  }
}
