import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'


async function getUser( user: string | null ) {
  const users = await prisma.$queryRawUnsafe('SELECT * FROM pesuser where org = $1', user?.toString())
  await prisma.$disconnect()
  return users
}

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  const decoded = jwt.decode(token);
  console.log('Decoded JWT:', decoded);

  if (token) {
    try {
      let userName: string | null = null;
      if (decoded && typeof decoded === 'object' && 'org' in decoded) {
        userName = (decoded as { org?: string }).org ?? null;
      }
      let userInfo = await getUser(userName);
      return NextResponse.json(userInfo)

    } catch(err) {
      console.error(err)
      return NextResponse.json([])
    }    
  }
  NextResponse.redirect(new URL('/not-found', request.url))
}