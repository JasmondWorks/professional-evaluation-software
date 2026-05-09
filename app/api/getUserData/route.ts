import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'

type Performance = {
  id: number
  dept: string
  type: string
  yield: string
  user_id: string
}

async function getUserData( user: string | null ) {
  const goodPerformance: Performance[] = await prisma.$queryRawUnsafe('SELECT * FROM performance where user_id = $1 and type = $2', user?.toString(), 'good')
  const badPerformance: Performance[] = await prisma.$queryRawUnsafe('SELECT * FROM performance where user_id = $1 and type = $2', user?.toString(), 'bad')
  
  await prisma.$disconnect()
  return { goodPerformance, badPerformance }
}

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  const user = jwt.verify( token, 'oti') as string;

  if (token) {
    try {
      let { goodPerformance, badPerformance} = await getUserData(user)
      console.log(user)
      return NextResponse.json({ goodPerformance, badPerformance })
  
    } catch(err) {
      console.error(err)
      return NextResponse.json({  goodPerformance: [], badPerformance: [] })
    }    
  }
  NextResponse.redirect(new URL('/not-found', request.url))
}