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
      orderBy: { created_at: 'desc' },
    })

    if (!cycle || cycle.phase === 'evaluated') {
      return NextResponse.json({ active: false })
    }

    // Advance the phase if a window's close date has passed.
    cycle.phase = await syncCyclePhase(prisma, cycle)

    const now = Date.now()
    const withinWindow = (opens: Date | null, closes: Date | null) =>
      (!opens || now >= opens.getTime()) && (!closes || now <= closes.getTime())

    const form5Open =
      cycle.phase === 'settings_open' &&
      withinWindow(cycle.settings_opens_at, cycle.settings_closes_at)
    const form6Open =
      cycle.phase === 'feeling_open' &&
      withinWindow(cycle.feeling_opens_at, cycle.feeling_closes_at)

    // Has this staff member already submitted Form 5 / Form 6 for THIS cycle?
    const submitted = userName
      ? (await prisma.stress_scores.count({
          where: { org: org ?? undefined, user_name: userName, cycle_id: cycle.id },
        })) > 0
      : false
    const form6Submitted = userName
      ? (await prisma.stress.count({
          where: { org: org ?? undefined, pesuser_name: userName, cycle_id: cycle.id },
        })) > 0
      : false

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

    return NextResponse.json({
      active: true,
      phase: cycle.phase,
      form5: { open: form5Open, submitted },
      form6: { open: form6Open, submitted: form6Submitted },
      cta,
    })
  } catch (err) {
    console.error('active-cycle error:', err)
    return NextResponse.json({ active: false })
  }
}
