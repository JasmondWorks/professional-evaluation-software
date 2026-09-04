// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'

// Returns the org's current stress cycle: its phase and the per-category limits
// computed by "Run Setting". Form 6 uses these limits as its category maxes.
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), {
    roles: ['super-admin', 'admin', 'lecturer', 'industrial-engineer', 'hod', 'employee-w', 'auditor'],
  })
  if (!auth.ok) return auth.response
  const org = auth.user.org

  try {
    const cycle = await prisma.stressCycle.findFirst({
      where: { org: org ?? undefined },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    })
    return NextResponse.json({
      phase: cycle?.phase ?? 'settings_open',
      limits: cycle?.category_limits ?? null,
    })
  } catch (err) {
    console.error('stress limits error:', err)
    return NextResponse.json({ phase: 'settings_open', limits: null })
  }
}
