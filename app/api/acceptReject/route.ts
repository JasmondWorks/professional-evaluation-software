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

    let mainTable = ''
    let counterTable = ''

    if (appraisalSections.includes(section)) {
      mainTable = 'appraisal'
      counterTable = 'counter_appraisal'
    } else if (userPerfSections.includes(section)) {
      mainTable = 'userperformance'
      counterTable = 'counter_userperformance'
    } else {
      return NextResponse.json({ error: `Unknown section '${section}' ❌` }, { status: 400 })
    }

    const [staffScoreRow]: any = await prisma.$queryRawUnsafe(`
      SELECT ${section} FROM ${mainTable}
      WHERE pesuser_name = '${staff}'
    `)

    const [counterScoreRow]: any = await prisma.$queryRawUnsafe(`
      SELECT ${section} FROM ${counterTable}
      WHERE pesuser_name = '${staff}'
    `)

    if (!staffScoreRow || !counterScoreRow)
      return NextResponse.json({ error: 'Scores not found ❌' }, { status: 404 })

    const staffScore = Number(staffScoreRow[section])
    const hodScore = Number(counterScoreRow[section])

    if (decision === 'accepted') {
      const avgScore = (staffScore + hodScore) / 2

      // ✅ Update main table with averaged score and mark as not pending
      await prisma.$executeRawUnsafe(`
        UPDATE ${mainTable}
        SET ${section} = ${avgScore}, pending = FALSE
        WHERE pesuser_name = '${staff}'
      `)

      // 🧹 Delete counter record after acceptance
      await prisma.$executeRawUnsafe(`
        DELETE FROM ${counterTable}
        WHERE pesuser_name = '${staff}'
      `)
    } else if (decision === 'rejected') {
      // ⚠️ Mark both as pending
      await prisma.$executeRawUnsafe(`
        UPDATE ${mainTable}
        SET pending = TRUE
        WHERE pesuser_name = '${staff}'
      `)

      await prisma.$executeRawUnsafe(`
        UPDATE ${counterTable}
        SET pending = TRUE
        WHERE pesuser_name = '${staff}'
      `)
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
