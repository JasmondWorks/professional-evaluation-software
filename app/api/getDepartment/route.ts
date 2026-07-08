import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'


async function getUser( user: string | null ) {
  if (!user) return []
  return prisma.pesuser.findMany({ where: { org: user } })
}

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  const decoded = jwt.decode(token);

  if (token) {
    try {
      let userName: string | null = null;
      if (typeof decoded === 'object' && decoded !== null && 'name' in decoded) {
        userName = (decoded as { name?: string }).name ?? null;
      }
      let userInfo = await getUser(userName)
      return NextResponse.json(userInfo)

    } catch(err) {
      console.error(err)
      return NextResponse.json([])
    }    
  }
  NextResponse.redirect(new URL('/not-found', request.url))
}