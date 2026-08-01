import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'
import { syncCyclePhase } from '../../_lib/stressCycle'

// The org's current stress cycle from the perspective of the logged-in user:
// what phase it's in, whether each form is open right now, and whether THIS
// staff member has already submitted Form 5. Drives the dashboard banner, the
// form open/closed states, and the "already submitted" view.
const FORM5_URL = '/data-entry/stress/stress-category'
const FORM6_URL = '/data-entry/stress/stress-feeling'

export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), {
    roles: ['super-admin', 'admin', 'lecturer', 'industrial-engineer', 'hod', 'employee-w', 'auditor'],
  })
  if (!auth.ok) return auth.response
  const org = auth.user.org
  const userName = auth.user.name

  try {
    const cycle = await prisma.stressCycle.findFirst({
      where: { org: org ?? undefined },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    })

    if (!cycle || cycle.phase === 'evaluated') {
      return NextResponse.json({ active: false })
    }

    // Advance the phase if a window's close date has passed.
    cycle.phase = await syncCyclePhase(prisma, cycle)

    const now = Date.now()
    const before = (d: Date | null) => !!d && now < d.getTime()

    // Three distinct states per form — crucially, "not_yet" (scheduled, before
    // its open date) is NOT the same as "closed" (after its window / past phase).
    let form5Status: 'not_yet' | 'open' | 'closed'
    if (cycle.phase === 'settings_open') {
      form5Status = before(cycle.settings_opens_at) ? 'not_yet' : 'open'
    } else {
      form5Status = 'closed'
    }

    let form6Status: 'not_yet' | 'open' | 'closed'
    if (cycle.phase === 'feeling_open') {
      form6Status = before(cycle.feeling_opens_at) ? 'not_yet' : 'open'
    } else if (cycle.phase === 'settings_open' || cycle.phase === 'settings_closed') {
      form6Status = 'not_yet'
    } else {
      form6Status = 'closed'
    }

    const form5Open = form5Status === 'open'
    const form6Open = form6Status === 'open'

    // Has this staff member already submitted Form 5 / Form 6 for THIS cycle?
    const submitted = userName
      ? (await prisma.stress_scores.count({
          where: { org: org ?? undefined, user_name: userName, cycle_id: cycle.id },
        })) > 0
      : false
    const form6Submitted = userName
      ? (await prisma.stress.count({
          where: { org: org ?? undefined, pesuser_name: userName, cycle_id: cycle.id, rejected: false },
        })) > 0
      : false
    // If this staff member's submission was sent back, surface the reason so they
    // see it right where they re-enter.
    const returned = userName
      ? await prisma.stress.findFirst({
          where: { org: org ?? undefined, pesuser_name: userName, cycle_id: cycle.id, rejected: true },
          select: { rejection_reason: true },
        })
      : null

    // The single most relevant call-to-action for the banner.
    let cta: { message: string; href: string } | null = null
    if (form5Open && !submitted) {
      cta = {
        message: 'The stress category form (Form 5) is open. Please complete it.',
        href: FORM5_URL,
      }
    } else if (form6Open && !form6Submitted) {
      cta = {
        message: 'The stress theme & feeling form (Form 6) is open. Please complete it.',
        href: FORM6_URL,
      }
    }

    // Advance heads-up: a form is scheduled but not open yet (and there's no
    // more urgent CTA). Lets staff know something is coming without acting yet.
    let notice: { message: string } | null = null
    if (!cta) {
      if (form5Status === 'not_yet' && !submitted && cycle.settings_opens_at) {
        notice = { message: `The stress category form opens ${new Date(cycle.settings_opens_at).toLocaleString()}.` }
      } else if (cycle.phase !== 'feeling_open' && form6Status === 'not_yet' && submitted && !form6Submitted) {
        notice = { message: 'The theme & feeling form will open once the category form closes and your organization computes the setting.' }
      }
    }

    // Admins and super-admins shouldn't receive form-filling CTAs or notices.
    if (auth.user.role === 'admin' || auth.user.role === 'super-admin') {
      cta = null;
      notice = null;
    }

    return NextResponse.json({
      active: true,
      phase: cycle.phase,
      notice,
      form5: {
        open: form5Open,
        status: form5Status,
        submitted,
        opensAt: cycle.settings_opens_at,
        closesAt: cycle.settings_closes_at,
      },
      form6: {
        open: form6Open,
        status: form6Status,
        submitted: form6Submitted,
        opensAt: cycle.feeling_opens_at,
        closesAt: cycle.feeling_closes_at,
        returnedReason: returned?.rejection_reason ?? null,
      },
      cta,
    })
  } catch (err) {
    console.error('active-cycle error:', err)
    return NextResponse.json({ active: false })
  }
}
