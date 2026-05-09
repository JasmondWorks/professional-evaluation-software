import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'

type user = {
  id:number
  name: string
  email: string 
  password: string
  gsm: string
  role: string
  address: string
  faculty_college: string
  dob: string
  doa: string
  poa : string
  doc : string
  post : string
  dopp: string
  level: string
  image : string
  org : string
}

async function getUser( user: string | null ) {
  const users: user[] = await prisma.$queryRawUnsafe('SELECT * FROM pesuser where name = $1', user?.toString())
  
  await prisma.$disconnect()
  return users[0]
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
      let userInfo = await getUser(userName)
      console.log(userInfo)
      return NextResponse.json(userInfo)
  
    } catch(err) {
      console.error(err)
      return NextResponse.json({ data: ['no data'] })
    }    
  }
  return NextResponse.json({ data: ['no data'] })
}