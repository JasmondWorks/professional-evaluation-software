import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'
import { meanLimits, CategoryValues } from '@/app/lib/stress/scoring'
import { CATEGORY_KEYS } from '@/app/lib/stress/instrument'
import { notifyOrgStaff } from '../../_lib/notify'

// "Run/Evaluate Setting" — the intermediate super-admin step between Form 5 and
// Form 6. It averages every staff member's Form 5 category values into the
// per-category limits that Form 6 will use as its maxes, and stores them on the
// org's stress cycle (advancing it to the feeling phase).
export async function POST(req: Request) {
  // Admin tier only (no capability needed — this is a super-admin control).
  const auth = authorize(tokenFromRequest(req), {})
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  try {
    const cycle = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    })
    if (!cycle) {
      return NextResponse.json({ error: 'No active stress cycle. Start a cycle first.' }, { status: 400 })
    }

    // Only this cycle's Form 5 submissions feed the setting.
    const rows = await prisma.stress_scores.findMany({ where: { org, cycle_id: cycle.id } })
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No Form 5 (stress category) submissions yet for this cycle.' },
        { status: 400 },
      )
    }

    // Each Form 5 row → that staff member's 10 category values.
    const staffValues: CategoryValues[] = rows.map((r: any) => {
      const v = {} as CategoryValues
      for (const k of CATEGORY_KEYS) v[k] = Number(r[k] ?? 0)
      return v
    })

    const limits = meanLimits(staffValues)

    // Optional Form 6 close date — set now, since its timing depends on when the
    // setting is computed (which is exactly now).
    const body = await req.json().catch(() => ({}))
    const feelingClosesAt = body?.feelingClosesAt ? new Date(body.feelingClosesAt) : null

    // Store the limits on this cycle and open the feeling phase (Form 6) right now.
    await prisma.stressCycle.update({
      where: { id: cycle.id },
      data: {
        category_limits: limits,
        phase: 'feeling_open',
        feeling_opens_at: new Date(),
        feeling_closes_at: feelingClosesAt,
      },
    })

    // Form 6/7 just opened — nudge staff.
    await notifyOrgStaff(
      prisma,
      org,
      'Theme & feeling form is open',
      'The theme & feeling form (Form 6/7) is now open. Please complete it from your dashboard.',
    )

    return NextResponse.json(
      { message: 'Setting computed.', staffCount: rows.length, limits, cycleId: cycle.id },
      { status: 200 },
    )
  } catch (err) {
    console.error('run-setting error:', err)
    return NextResponse.json({ error: 'Failed to compute setting' }, { status: 500 })
  }
}
