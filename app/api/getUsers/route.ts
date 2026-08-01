import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'

async function getUsers( user: string | null ) {
  if (!user) return []
  return prisma.pesuser.findMany({ where: { org: user } })
}

export async function POST(request: NextRequest) {
  const auth = authorize(tokenFromRequest(request), {});
  if (!auth.ok) return auth.response;

  try {
    const userOrg = auth.user.org ? String(auth.user.org) : null;
    let userInfo = await getUsers(userOrg)
    return NextResponse.json(userInfo)
  } catch(err) {
    console.error(err)
    return NextResponse.json({ data: ['no data'] })
  }    
}