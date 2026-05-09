import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'


async function getInventory( user: string | null ) {
  const users = await prisma.$queryRawUnsafe('SELECT * FROM facilities where org = $1', user?.toString())
  await prisma.$disconnect()
  return users
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();

  if (name) {
    try {
      let userInfo = await getInventory(name)
      console.log(userInfo);
      
      return NextResponse.json(userInfo)

    } catch(err) {
      console.error(err)
      return NextResponse.json([])
    }    
  }
  return NextResponse.redirect(new URL('/not-found', request.url))
} 