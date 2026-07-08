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

    const record = await prisma.counter_totals.create({
      data: {
        section: Number(section),
        result: Number(result),
        numerator: numerator.map(Number),
        denominator: denominator.map(Number),
      },
    })

    return NextResponse.json({ success: true, record }, { status: 201 })
  } catch (err: any) {
    console.error('Error saving counter totals:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    )
  }
}
