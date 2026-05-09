import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'


async function getUser(user: string | null) {

  const users = await prisma.$queryRaw`
    SELECT
      id,
      name,
      email,
      gsm,
      role,
      address,
      dept,
      faculty_college,
      dob,
      doa,
      poa,
      doc,
      post,
      dopp,
      level,
      image,
      org
    FROM pesuser
    WHERE org = ${user?.toString()}
  `

  await prisma.$disconnect()
  return users
}


export async function POST(request: NextRequest) {

  const { token } = await request.json()
  const decoded = jwt.decode(token)

  console.log('Decoded JWT:', decoded)

  if (token) {
    try {

      let userName: string | null = null

      if (decoded && typeof decoded === 'object' && 'org' in decoded) {
        userName = (decoded as { org?: string }).org ?? null
      }

      let userInfo = await getUser(userName)

      return NextResponse.json(userInfo)

    } catch (err) {

      console.error(err)
      return NextResponse.json([])

    }
  }

  return NextResponse.redirect(new URL('/not-found', request.url))
}