import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'


async function getRoles( user: string | null ) {
  const users = await prisma.$queryRawUnsafe('SELECT * FROM roles where org = $1', user?.toString())
  await prisma.$disconnect()
  return users
}

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  const user = jwt.decode(token);

  if (token) {
    try {
      let userName: string | null = null;
      if (typeof user === 'object' && user !== null && 'name' in user) {
        userName = (user as { name?: string }).name ?? null;
      }
      let userInfo = await getRoles(userName);
      return NextResponse.json(userInfo);

    } catch(err) {
      console.error(err)
      return NextResponse.json([]);
    }    
  }
  NextResponse.redirect(new URL('/not-found', request.url))
}