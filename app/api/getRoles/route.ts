import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'


async function getRoles( user: string | null ) {
  if (!user) return []
  return prisma.roles.findMany({ where: { org: user } })
}

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  const user = jwt.decode(token);

  if (token) {
    try {
      let userOrg: string | null = null;
      if (typeof user === 'object' && user !== null && 'org' in user) {
        userOrg = (user as { org?: string }).org ?? null;
      }
      let userInfo = await getRoles(userOrg);
      return NextResponse.json(userInfo);

    } catch(err) {
      console.error(err)
      return NextResponse.json([]);
    }    
  }
  NextResponse.redirect(new URL('/not-found', request.url))
}