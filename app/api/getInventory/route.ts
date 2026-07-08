import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'


async function getInventory( user: string | null ) {
  if (!user) return []
  return prisma.facilities.findMany({ where: { org: user } })
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