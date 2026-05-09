// app/api/counterTotals/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { section, result, numerator = [], denominator = [] } = body

    if (!section || result === undefined || result === null) {
      return NextResponse.json(
        { error: 'Missing required fields (section or result)' },
        { status: 400 }
      )
    }

    // Construct properly typed arrays
    const numArray = `{${numerator.map(Number).join(',')}}`
    const denArray = `{${denominator.map(Number).join(',')}}`

    // Use Prisma's queryRaw for the database operation
    const [record]: any = await prisma.$queryRaw`
      INSERT INTO counter_totals (
        section, result, numerator, denominator
      )
      VALUES (
        ${Number(section)},
        ${Number(result)},
        ${numArray}::numeric[],
        ${denArray}::numeric[]
      )
      RETURNING *;
    `

    return NextResponse.json({ success: true, record }, { status: 201 })
  } catch (err: any) {
    console.error('Error saving counter totals:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    )
  }
}
