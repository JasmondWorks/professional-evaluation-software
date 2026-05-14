import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'

type Goals = {
  id: number
  name: string
  description: string
  status: string
  day_started: string
  due_date: string
  user_id: string
}

async function getData( user: string | null ) {
  console.log(user)
  const goals: Goals[] = await prisma.$queryRawUnsafe('SELECT * FROM goals WHERE user_id = $1', user?.toString())
  
  await prisma.$disconnect()
  return goals
}

export async function POST(request: NextRequest) {
  const token = await request.json();
  const user = token.userID ?? token.name;
  if (token) {
    try {
      let goals = await getData(user)
      return NextResponse.json(goals)
  
    } catch(err) {
      console.error(err)
      return NextResponse.json([])
    }
  } else {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 })
  }
}