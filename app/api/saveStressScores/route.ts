import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'
import { effectivePhase } from '../_lib/stressCycle'

// Creates the row, and if the id auto-increment sequence has drifted (common
// after a DB restore → intermittent "unique constraint on id" 500s that showed
// the user a false "something went wrong" even though a retry saved), resync the
// sequence to MAX(id) and retry once.
async function createStressScore(data: Prisma.stress_scoresUncheckedCreateInput) {
  try {
    return await prisma.stress_scores.create({ data })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      // The only $executeRawUnsafe left in the app, and deliberately so: the
      // statement is a fixed string with nothing interpolated into it. It is
      // Unsafe rather than tagged because it takes no parameters at all — a
      // tagged template would have nothing to bind.
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('stress_scores','id'), GREATEST((SELECT MAX(id) FROM stress_scores), 1))`,
      )
      return await prisma.stress_scores.create({ data })
    }
    throw e
  }
}

// Saves a staff member's Stress Category (Form 5) totals into stress_scores.
// (Previously this endpoint was a mis-copied performance saver: it read
// competence/integrity and wrote to `userperformance`, so Form 5 submissions
// silently failed and nothing ever populated stress_scores.)

type Scores = {
  organizational?: number
  student?: number
  administrative?: number
  teacher?: number
  parents?: number
  occupational?: number
  personal?: number
  academic_program?: number
  negative_public_attitude?: number
  misc?: number
}

export async function POST(req: Request) {
  try {
    // Any authenticated staff member may submit their own stress form.
    const auth = authorize(tokenFromRequest(req), {
      roles: ['super-admin', 'admin', 'lecturer', 'industrial-engineer', 'hod', 'employee-w', 'auditor'],
    })
    if (!auth.ok) return auth.response

    const org = auth.user.org
    const body = await req.json()
    const user_name: string | undefined = body.user_name || auth.user.name
    const scores: Scores = body.scores || {}

    if (!user_name || !org) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // There must be an open settings phase to accept a Form 5 submission.
    const cycle = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    })
    if (!cycle || effectivePhase(cycle) !== 'settings_open') {
      return NextResponse.json(
        { message: 'The stress category form is not currently open for submissions.' },
        { status: 409 },
      )
    }

    // One submission per staff member per cycle — enforced here (not just in the UI).
    const already = await prisma.stress_scores.count({
      where: { user_name, org, cycle_id: cycle.id },
    })
    if (already > 0) {
      return NextResponse.json(
        { message: 'You have already submitted this form for the current cycle.' },
        { status: 409 },
      )
    }

    // Department comes from the staff member's profile, not the client.
    const profile = await prisma.pesuser.findFirst({
      where: { name: user_name, org },
      select: { dept: true },
    })
    const dept = profile?.dept ?? null

    await createStressScore({
      organizational: scores.organizational ?? 0,
      student: scores.student ?? 0,
      administrative: scores.administrative ?? 0,
      teacher: scores.teacher ?? 0,
      parents: scores.parents ?? 0,
      occupational: scores.occupational ?? 0,
      personal: scores.personal ?? 0,
      academic_program: scores.academic_program ?? 0,
      negative_public_attitude: scores.negative_public_attitude ?? 0,
      misc: scores.misc ?? 0,
      org,
      dept,
      user_name,
      cycle_id: cycle.id,
    })

    return NextResponse.json({ message: 'Stress scores saved' }, { status: 200 })
  } catch (error) {
    console.error('saveStressScores error:', error)
    return NextResponse.json({ message: 'Failed to save stress scores' }, { status: 500 })
  }
}
