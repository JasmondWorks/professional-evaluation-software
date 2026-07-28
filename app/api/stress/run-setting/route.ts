import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'
import { meanLimits, CategoryValues } from '@/app/lib/stress/scoring'
import { CATEGORY_KEYS } from '@/app/lib/stress/instrument'

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
      orderBy: { created_at: 'desc' },
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

    // Store the limits on this cycle and open the feeling phase (Form 6).
    await prisma.stressCycle.update({
      where: { id: cycle.id },
      data: { category_limits: limits, phase: 'feeling_open' },
    })

    return NextResponse.json(
      { message: 'Setting computed.', staffCount: rows.length, limits, cycleId: cycle.id },
      { status: 200 },
    )
  } catch (err) {
    console.error('run-setting error:', err)
    return NextResponse.json({ error: 'Failed to compute setting' }, { status: 500 })
  }
}
