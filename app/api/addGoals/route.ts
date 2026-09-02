import { NextRequest, NextResponse } from 'next/server'
import { getJWTSecret } from '@/app/lib/jwt';
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'
import { validateData, createGoalSchema, formatZodErrors } from '@/app/lib/validation'

type Goals = {
  name: string
  description: string
  due_date: string
  user_id: string
  evaluation_type: 'appraisal' | 'performance' | 'stress'
}

async function updateData(entry: Goals) {
  const userId = entry.user_id
  const userIdNum = Number(userId)

  if (!entry.user_id) {
    throw new Error('Invalid user_id: must be provided')
  }

  const goal = await prisma.goals.create({
    data: {
      name: entry.name,
      description: entry.description,
      status: 70,
      day_started: new Date('1990-01-01'),
      due_date: new Date(entry.due_date),
      user_id: userId,
    },
    select: {
      id: true,
    },
  })

  const goalId = goal.id

  const title = `New Goal Created: ${entry.name}`
  const message = `${entry.description} (Due: ${entry.due_date})`

  // Resolve the goal owner's org, then notify every user in that org.
  const owner = await prisma.pesuser.findUnique({
    where: { id: userIdNum },
    select: { org: true },
  })
  const orgName = owner?.org ?? null

  if (orgName) {
    const orgUsers = await prisma.pesuser.findMany({
      where: { org: orgName },
      select: { id: true, org: true },
    })

    await prisma.notifications.createMany({
      data: orgUsers.map((u) => ({
        user_id: u.id,
        org: u.org,
        title,
        message,
      })),
    })

    const orgRecord = await prisma.org.findUnique({
      where: { name: orgName },
      select: { name: true, evaluation: true },
    })

    if (orgRecord) {
      const evaluations = orgRecord.evaluation || []
      const updatedEvaluations = evaluations.includes(entry.evaluation_type)
        ? evaluations
        : [...evaluations, entry.evaluation_type]

      await prisma.org.update({
        where: { name: orgRecord.name },
        data: {
          evaluation: updatedEvaluations,
          ongoing: true,
          updated_at: new Date(),
        },
      })
    }
  }

  return { message: 'success', status: 200, goalId }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Verify JWT token from body
    const token = data.token || data.access_token
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    jwt.verify(token, getJWTSecret())

    // Validate input
    const validation = validateData(createGoalSchema, data)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.errors!) },
        { status: 400 }
      )
    }

    const goals = await updateData(validation.data!)
    return NextResponse.json(goals)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}