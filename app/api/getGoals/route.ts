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
  console.log(token);
  const user = token.name;
  if (token) {
    try {
      let goals = await getData(user)
      console.log(user)
      return NextResponse.json(goals)
  
    } catch(err) {
      console.error(err)
      return NextResponse.json([])
    }    
  }
  NextResponse.redirect(new URL('/not-found', request.url))
}