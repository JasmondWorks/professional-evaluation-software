import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'

// Start a new stress cycle for the org (admin only). An org may only have one
// active cycle at a time. The system chooses the cycle shape:
//   • FULL          (Form 5 → Run Setting → Form 6 → Evaluate)  — first ever cycle,
//                    or the previous evaluation flagged a reset (5% rule), or the
//                    admin forces re-collection.
//   • FEELING-ONLY  (skip Form 5, reuse the stored limits → Form 6 → Evaluate).
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {})
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  const body = await req.json().catch(() => ({}))

  try {
    const latest = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: { created_at: 'desc' },
    })

    // Guardrail 1: one active cycle at a time.
    if (latest && latest.phase !== 'evaluated') {
      return NextResponse.json(
        { error: 'A stress cycle is already in progress for your organization.' },
        { status: 409 },
      )
    }

    // Guardrail 2: full vs feeling-only.
    const hasAdoptedSetting = !!(latest && latest.category_limits)
    const needsReset = !!(latest && latest.needs_reset)
    const full = !hasAdoptedSetting || needsReset || body.forceSettings === true

    const cycle = await prisma.stressCycle.create({
      data: {
        org,
        mode: body.mode === 'multi' ? 'multi' : 'once',
        phase: full ? 'settings_open' : 'feeling_open',
        // Feeling-only reuses the last adopted limits.
        category_limits: full ? undefined : (latest?.category_limits ?? undefined),
        settings_opens_at: body.settingsOpensAt ? new Date(body.settingsOpensAt) : full ? new Date() : null,
        settings_closes_at: body.settingsClosesAt ? new Date(body.settingsClosesAt) : null,
        feeling_opens_at: body.feelingOpensAt ? new Date(body.feelingOpensAt) : null,
        feeling_closes_at: body.feelingClosesAt ? new Date(body.feelingClosesAt) : null,
        created_by: String(auth.user.userID ?? ''),
      },
    })

    return NextResponse.json(
      { message: full ? 'Cycle started — Form 5 (settings) is open.' : 'Cycle started — Form 6 (feeling) is open.', cycle, type: full ? 'full' : 'feeling_only' },
      { status: 200 },
    )
  } catch (err) {
    console.error('start-cycle error:', err)
    return NextResponse.json({ error: 'Failed to start cycle' }, { status: 500 })
  }
}
