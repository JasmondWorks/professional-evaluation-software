// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

// app/api/counterTotals/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'
import { validateData, counterTotalsSchema, formatZodErrors } from '@/app/lib/validation';

// Stores a counter-evaluation total. counter_totals carries no org column, so
// there is nothing to scope by here — but writing one is still not something an
// anonymous caller should be able to do.
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json()
    const parsed = validateData(counterTotalsSchema, body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(parsed.errors!) },
        { status: 400 }
      )
    }
    const { section, result, numerator = [], denominator = [] } = parsed.data!

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
