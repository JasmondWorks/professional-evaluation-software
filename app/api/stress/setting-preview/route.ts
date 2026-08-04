import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'
import { meanLimits, CategoryValues } from '@/app/lib/stress/scoring'
import { CATEGORY_KEYS } from '@/app/lib/stress/instrument'

// Read-only "view Form 5 results on demand". Computes the per-category mean
// limits from the current cycle's Form 5 submissions WITHOUT mutating the cycle
// or changing its phase — so an admin can inspect the setting at any point
// (before running it, after Form 6 is open, whenever). Admin tier only.
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), {})
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  try {
    const cycle = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    })
    if (!cycle) return NextResponse.json({ active: false })

    const rows = await prisma.stress_scores.findMany({ where: { org, cycle_id: cycle.id } })

    // If the setting was already run, the stored limits are the source of truth;
    // otherwise compute a live preview from whatever Form 5 data exists so far.
    const stored = (cycle.category_limits as Record<string, number> | null) || null

    const staffValues: CategoryValues[] = rows.map((r: any) => {
      const v = {} as CategoryValues
      for (const k of CATEGORY_KEYS) v[k] = Number(r[k] ?? 0)
      return v
    })
    const computed = rows.length > 0 ? meanLimits(staffValues) : null

    return NextResponse.json({
      active: true,
      phase: cycle.phase,
      staffCount: rows.length,
      // Prefer stored (locked-in) limits; fall back to the live computation.
      limits: stored ?? computed ?? {},
      locked: !!stored,
      limitsSource: cycle.limits_source,
    })
  } catch (err) {
    console.error('setting-preview error:', err)
    return NextResponse.json({ error: 'Failed to compute preview' }, { status: 500 })
  }
}
