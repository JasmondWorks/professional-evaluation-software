// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'
import { notifyOrgStaff } from '../../_lib/notify'
import { getActiveSession, startSession } from '../../../lib/stress/sessions'

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
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
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
    
    // Determine the source of the settings for this cycle
    const historyCycleId = body.historyCycleId ? Number(body.historyCycleId) : null;
    const full = !historyCycleId && (!hasAdoptedSetting || needsReset || body.forceSettings === true)

    let session = await getActiveSession(prisma, org);
    if (full || !session) {
       session = await startSession(prisma, org, String(auth.user.userID ?? ''));
    }

    let limits = undefined;
    let limitsSource = 'recomputed';
    let inheritedFrom = null;

    if (!full) {
      if (historyCycleId) {
        const historyCycle = await prisma.stressCycle.findUnique({ where: { id: historyCycleId } });
        limits = historyCycle?.category_limits ?? undefined;
        limitsSource = 'loaded_from_history';
        inheritedFrom = historyCycleId;
      } else {
        limits = latest?.category_limits ?? undefined;
        limitsSource = 'inherited';
        inheritedFrom = latest?.id ?? null;
      }
    }

    const cycle = await prisma.stressCycle.create({
      data: {
        org,
        session_id: session.id,
        iteration: session.current_iteration + 1,
        limits_source: limitsSource,
        inherited_from_cycle_id: inheritedFrom,
        mode: body.mode === 'multi' ? 'multi' : 'once',
        phase: full ? 'settings_open' : 'feeling_open',
        category_limits: limits ?? undefined,
        settings_opens_at: body.settingsOpensAt ? new Date(body.settingsOpensAt) : full ? new Date() : null,
        settings_closes_at: body.settingsClosesAt ? new Date(body.settingsClosesAt) : null,
        feeling_opens_at: body.feelingOpensAt ? new Date(body.feelingOpensAt) : null,
        feeling_closes_at: body.feelingClosesAt ? new Date(body.feelingClosesAt) : null,
        created_by: String(auth.user.userID ?? ''),
      },
    })

    // Nudge every staff member that a stress exercise has started.
    await notifyOrgStaff(
      prisma,
      org,
      full ? 'Stress form is open' : 'Theme & feeling form is open',
      full
        ? 'A stress exercise has started. Please complete Form 5 (stress categories) — check your dashboard.'
        : 'The theme & feeling form (Form 6/7) is now open. Please complete it from your dashboard.',
    )

    return NextResponse.json(
      { message: full ? 'Cycle started — Form 5 (settings) is open.' : 'Cycle started — Form 6 (feeling) is open.', cycle, type: full ? 'full' : 'feeling_only' },
      { status: 200 },
    )
  } catch (err) {
    console.error('start-cycle error:', err)
    return NextResponse.json({ error: 'Failed to start cycle' }, { status: 500 })
  }
}
