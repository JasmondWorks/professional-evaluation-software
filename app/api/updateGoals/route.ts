import { NextRequest, NextResponse } from 'next/server'
import { getJWTSecret } from '@/app/lib/jwt';
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'
import { validateData, updateGoalSchema, formatZodErrors } from '@/app/lib/validation'

type Goals = {
  name: string
  description: string
  due_date: string
  user_id: string
  id: string
}

async function updateData( entry: Goals ) {
   await prisma.goals.updateMany({
     where: { id: Number(entry.id), user_id: entry.user_id },
     data: {
       name: entry.name,
       description: entry.description,
       due_date: new Date(entry.due_date),
     },
   })

   return { message: 'success', status: 200 }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    // Verify JWT token from body
    const token = data.token || data.access_token
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    jwt.verify(token, getJWTSecret())

    // Validate input
    const validation = validateData(updateGoalSchema, data)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.errors!) },
        { status: 400 }
      )
    }

    const goals = await updateData(validation.data!)
    return NextResponse.json(goals)
  
  } catch(err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    )
  }
}