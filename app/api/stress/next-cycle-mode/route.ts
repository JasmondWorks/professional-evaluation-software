// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'

// Tells the admin, BEFORE starting, what shape the next stress cycle will take:
//   • full         → collects Form 5 first (no prior setting, or a reset was flagged)
//   • feeling-only → reuses the last setting and opens Form 6 directly
// So the Start-Cycle screen can show the right window and not silently ignore a
// Form 5 window the admin set.
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), {})
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  try {
    const latest = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    })

    // A cycle already running blocks starting a new one.
    const cycleInProgress = !!(latest && latest.phase !== 'evaluated')
    const hasSetting = !!(latest && latest.category_limits)
    const needsReset = !!(latest && latest.needs_reset)
    // Same rule start-cycle uses (before any admin override).
    const willBeFull = !hasSetting || needsReset

    return NextResponse.json({
      cycleInProgress,
      hasSetting,
      needsReset,
      willBeFull,
    })
  } catch (err) {
    console.error('next-cycle-mode error:', err)
    return NextResponse.json({ error: 'Failed to determine next cycle mode' }, { status: 500 })
  }
}
