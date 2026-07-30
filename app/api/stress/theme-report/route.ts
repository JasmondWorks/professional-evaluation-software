import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'
import { CATEGORY_LABEL, CategoryKey, CATEGORY_KEYS } from '@/app/lib/stress/instrument'

// Aggregates the org's Form 6/7 (theme & feeling) submissions for the current
// cycle into the report figures: which stress THEMES are most frequent overall
// (Form 6), and the dominant FEELING per stress category (Form 7). Admin only.
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), {})
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  try {
    const cycle = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: { created_at: 'desc' },
    })
    if (!cycle) return NextResponse.json({ active: false })

    const rows = await prisma.stress.findMany({ where: { org, cycle_id: cycle.id, rejected: false } })

    // --- Form 6: theme frequencies across all staff ---
    const themeTotals: Record<string, number> = {}
    // --- Form 7: feeling totals per category across all staff ---
    const feelingByCat: Record<string, Record<string, number>> = {}

    for (const row of rows) {
      const data: any = row.assessment_data || {}
      const f6 = data.stressThemes
      const f7 = data.stressFeelings

      if (Array.isArray(f6?.themeTotals)) {
        for (const t of f6.themeTotals) {
          themeTotals[t.theme] = (themeTotals[t.theme] || 0) + (Number(t.total) || 0)
        }
      }
      if (f7?.values && typeof f7.values === 'object') {
        for (const [catKey, feelObj] of Object.entries(f7.values as Record<string, any>)) {
          feelingByCat[catKey] ||= {}
          for (const [feeling, val] of Object.entries(feelObj as Record<string, any>)) {
            feelingByCat[catKey][feeling] = (feelingByCat[catKey][feeling] || 0) + (Number(val) || 0)
          }
        }
      }
    }

    const grand = Object.values(themeTotals).reduce((s, v) => s + v, 0)
    const themes = Object.entries(themeTotals)
      .map(([theme, total]) => ({
        theme,
        total,
        percent: grand > 0 ? (total / grand) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)

    const categories = CATEGORY_KEYS.map((key: CategoryKey) => {
      const feels = feelingByCat[key] || {}
      const entries = Object.entries(feels).sort((a, b) => b[1] - a[1])
      return {
        key,
        label: CATEGORY_LABEL[key],
        dominant: entries[0]?.[0] ?? null,
        feelings: feels,
      }
    })

    return NextResponse.json({
      active: true,
      staffCount: rows.length,
      themes,
      categories,
    })
  } catch (err) {
    console.error('theme-report error:', err)
    return NextResponse.json({ error: 'Failed to build report' }, { status: 500 })
  }
}
