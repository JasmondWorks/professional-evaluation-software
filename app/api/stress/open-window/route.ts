import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'
import { effectivePhase } from '../../_lib/stressCycle'

// Open a SCHEDULED window immediately (admin) — for a form whose open date is
// still in the future. Sets the open date to now so staff can start right away.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {})
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  try {
    const cycle = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: { created_at: 'desc' },
    })
    if (!cycle) return NextResponse.json({ error: 'No active cycle.' }, { status: 400 })

    const now = new Date()
    const before = (d: Date | null) => !!d && now.getTime() < d.getTime()
    const eff = effectivePhase(cycle)

    if (eff === 'settings_open' && before(cycle.settings_opens_at)) {
      await prisma.stressCycle.update({
        where: { id: cycle.id },
        data: { settings_opens_at: now },
      })
      return NextResponse.json({ message: 'Form 5 (stress category) is now open.' })
    }

    if (eff === 'feeling_open' && before(cycle.feeling_opens_at)) {
      await prisma.stressCycle.update({
        where: { id: cycle.id },
        data: { feeling_opens_at: now },
      })
      return NextResponse.json({ message: 'Form 6/7 (themes & feeling) is now open.' })
    }

    return NextResponse.json({ error: 'There is no scheduled window to open right now.' }, { status: 400 })
  } catch (err) {
    console.error('open-window error:', err)
    return NextResponse.json({ error: 'Failed to open window' }, { status: 500 })
  }
}
