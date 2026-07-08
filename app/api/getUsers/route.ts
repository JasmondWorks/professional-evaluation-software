import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'

async function getUsers( user: string | null ) {
  if (!user) return []
  return prisma.pesuser.findMany({ where: { org: user } })
}

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  const user = jwt.decode( token);
  console.log(token)

  if (token) {
    try {
      let userName: string | null = null;
      if (typeof user === 'object' && user !== null && 'name' in user && typeof (user as any).name === 'string') {
        userName = (user as any).name;
      }
      let userInfo = await getUsers(userName)
      console.log(userInfo)
      return NextResponse.json(userInfo)
  
    } catch(err) {
      console.error(err)
      return NextResponse.json({ data: ['no data'] })
    }    
  }
  return NextResponse.json({ data: ['no data'] })
}