import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { verifyToken } from '../_lib/authGuard'
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
    where: { id: userId },
    select: { org_id: true },
  })
  const orgId = owner?.org_id ?? null

  if (orgId != null) {
    const orgUsers = await prisma.pesuser.findMany({
      where: { org_id: orgId },
      select: { id: true, org_id: true },
    })

    await prisma.notifications.createMany({
      data: orgUsers.map((u) => ({
        user_id: u.id,
        org_id: u.org_id,
        title,
        message,
      })),
    })

    const orgRecord = await prisma.org.findFirst({
      where: { id: orgId },
      select: { id: true, evaluation: true },
    })

    if (orgRecord) {
      const evaluations = orgRecord.evaluation || []
      const updatedEvaluations = evaluations.includes(entry.evaluation_type)
        ? evaluations
        : [...evaluations, entry.evaluation_type]

      await prisma.org.update({
        where: { id: orgRecord.id },
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
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate input
    const validation = validateData(createGoalSchema, data)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.errors!) },
        { status: 400 }
      )
    }

    // Goals are created for the caller — never trust a client-supplied
    // user_id, or any signed-in user could spam notifications and flip
    // evaluation flags on an organization they don't belong to.
    if (!decoded.userID || validation.data!.user_id !== decoded.userID) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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