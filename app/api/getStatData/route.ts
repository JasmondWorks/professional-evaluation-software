import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'

async function getStats( user: string | null ) {
  const users = await prisma.$queryRawUnsafe<any[]>('SELECT * FROM pesuser WHERE org = $1', user?.toString())
  const appraisals: any[] = await prisma.$queryRawUnsafe('SELECT * FROM appraisal WHERE org = $1', user?.toString())
//   const assessments = await prisma.$queryRawUnsafe('SELECT * FROM assesments WHERE org = $1', user?.toString())
  
  
  await prisma.$disconnect()
  return [ users.length, appraisals.length, 67 ]
}

export async function POST(request: NextRequest) {
  const { user } = await request.json();

  if (user) {
    try {
      let userInfo = await getStats(user)
      return NextResponse.json(userInfo)

    } catch(err) {
      console.error(err)
      return NextResponse.json([])
    }    
  }
  NextResponse.redirect(new URL('/not-found', request.url))
}