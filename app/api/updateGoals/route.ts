import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { verifyToken } from '../_lib/authGuard'
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
     where: { id: entry.id, user_id: entry.user_id },
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
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate input
    const validation = validateData(updateGoalSchema, data)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.errors!) },
        { status: 400 }
      )
    }

    // The goal owner is the caller — never trust a client-supplied user_id,
    // or any signed-in user could overwrite anyone else's goal by id.
    if (!decoded.userID || validation.data!.user_id !== decoded.userID) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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