import { NextRequest, NextResponse } from 'next/server'
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
   const params = [ entry.name, entry.description, new Date(entry.due_date), entry.id, entry.user_id  ]
   const query = `
      UPDATE goals
      SET
         name = $1,
         description = $2,
         due_date = $3
      WHERE id = $4
      AND user_id = $5
      RETURNING *;
   `
   await prisma.$queryRawUnsafe(query, ...params)
  
   await prisma.$disconnect()
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
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production')

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