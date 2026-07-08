import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'

async function getUserData( user: string | null ) {
  if (!user) return { goodPerformance: [], badPerformance: [] }

  const [goodPerformance, badPerformance] = await Promise.all([
    prisma.performance.findMany({ where: { user_id: user, type: 'good' } }),
    prisma.performance.findMany({ where: { user_id: user, type: 'bad' } }),
  ])

  return { goodPerformance, badPerformance }
}

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  const user = jwt.verify( token, process.env.JWT_SECRET || 'fallback-secret-change-in-production') as { userID: string | number };

  if (token) {
    try {
      let { goodPerformance, badPerformance} = await getUserData(user?.userID?.toString() ?? null)
      console.log(user)
      return NextResponse.json({ goodPerformance, badPerformance })
  
    } catch(err) {
      console.error(err)
      return NextResponse.json({  goodPerformance: [], badPerformance: [] })
    }    
  }
  NextResponse.redirect(new URL('/not-found', request.url))
}