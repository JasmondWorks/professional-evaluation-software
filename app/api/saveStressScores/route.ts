import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'

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

    // Department comes from the staff member's profile, not the client.
    const profile = await prisma.pesuser.findFirst({
      where: { name: user_name, org },
      select: { dept: true },
    })
    const dept = profile?.dept ?? null

    const data = {
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
    }

    // Idempotent: one stress-category record per staff member per org — a
    // resubmission replaces the previous one instead of duplicating.
    await prisma.stress_scores.deleteMany({ where: { user_name, org } })
    await prisma.stress_scores.create({ data })

    return NextResponse.json({ message: 'Stress scores saved' }, { status: 200 })
  } catch (error) {
    console.error('saveStressScores error:', error)
    return NextResponse.json({ message: 'Failed to save stress scores' }, { status: 500 })
  }
}
