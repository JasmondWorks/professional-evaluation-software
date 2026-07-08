import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { section, decision, staff, user } = body

    if (!section || !decision || !staff)
      return NextResponse.json({ error: 'Missing fields ❌' }, { status: 400 })

    const appraisalSections = [
      'teaching_quality_evaluation',
      'research_quality_evaluation',
      'administrative_quality_evaluation',
      'community_quality_evaluation',
      'other_relevant_information',
    ]

    const userPerfSections = [
      'competence',
      'integrity',
      'compatibility',
      'use_of_resources',
    ]

    // Pick typed delegates for the relevant table pair.
    let mainDelegate: any
    let counterDelegate: any

    if (appraisalSections.includes(section)) {
      mainDelegate = prisma.appraisal
      counterDelegate = prisma.counter_appraisal
    } else if (userPerfSections.includes(section)) {
      mainDelegate = prisma.userperformance
      counterDelegate = prisma.counter_userperformance
    } else {
      return NextResponse.json({ error: `Unknown section '${section}' ❌` }, { status: 400 })
    }

    // `section` is validated against the allowlists above, so the dynamic key is safe.
    const staffScoreRow = await mainDelegate.findFirst({
      where: { pesuser_name: staff },
      select: { [section]: true },
    })

    const counterScoreRow = await counterDelegate.findFirst({
      where: { pesuser_name: staff },
      select: { [section]: true },
    })

    if (!staffScoreRow || !counterScoreRow)
      return NextResponse.json({ error: 'Scores not found ❌' }, { status: 404 })

    const staffScore = Number(staffScoreRow[section])
    const hodScore = Number(counterScoreRow[section])

    if (decision === 'accepted') {
      const avgScore = (staffScore + hodScore) / 2

      // ✅ Update main table with averaged score and mark as not pending
      await mainDelegate.updateMany({
        where: { pesuser_name: staff },
        data: { [section]: avgScore, pending: false },
      })

      // 🧹 Delete counter record after acceptance
      await counterDelegate.deleteMany({ where: { pesuser_name: staff } })
    } else if (decision === 'rejected') {
      // ⚠️ Mark both as pending
      await mainDelegate.updateMany({
        where: { pesuser_name: staff },
        data: { pending: true },
      })

      await counterDelegate.updateMany({
        where: { pesuser_name: staff },
        data: { pending: true },
      })
    } else {
      return NextResponse.json({ error: 'Invalid decision value ❌' }, { status: 400 })
    }

    return NextResponse.json({
      message:
        decision === 'accepted'
          ? `✅ ${section} score accepted, averaged, and counter entry deleted`
          : `⚠️ ${section} score rejected and marked pending`,
    })
  } catch (err) {
    console.error('Error in /api/acceptReject:', err)
    return NextResponse.json({ error: 'Internal Server Error ❌' }, { status: 500 })
  }
}
