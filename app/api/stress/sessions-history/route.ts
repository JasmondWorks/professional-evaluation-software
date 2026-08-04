import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'

export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), {})
  if (!auth.ok) return auth.response
  const org = auth.user.org
  if (!org) return NextResponse.json({ error: 'Missing org' }, { status: 400 })

  try {
    const cycles = await prisma.stressCycle.findMany({
      where: { 
        org,
        category_limits: { not: Prisma.DbNull }
      },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        session_id: true,
        iteration: true,
        created_at: true,
        category_limits: true,
        feelingResults: {
          select: {
            triggered_reset: true
          },
          take: 1
        }
      }
    });

    const formatted = cycles.map(c => ({
      id: c.id,
      sessionId: c.session_id,
      iteration: c.iteration,
      createdAt: c.created_at,
      limits: c.category_limits,
      triggeredReset: c.feelingResults[0]?.triggered_reset ?? false
    }));

    return NextResponse.json({ history: formatted }, { status: 200 })
  } catch (err) {
    console.error('sessions-history error:', err)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
