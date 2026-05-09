import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'

type Goals = {
  name: string      // e.g., "Quarterly Appraisal"
  description: string
  due_date: string
  user_id: string
  evaluation_type: 'appraisal' | 'performance' | 'stress' // type to save in org.evaluation
}

async function updateData(entry: Goals) {
  // -------------------------
  // Insert goal
  // -------------------------
  const params = [entry.name, entry.description, new Date(entry.due_date), entry.user_id]
  const query = `
    INSERT INTO goals (name, description, status, day_started, due_date, user_id)
    VALUES ($1, $2, 70, '1990-01-01', $3, $4)
    RETURNING id;
  `
  const result = await prisma.$queryRawUnsafe(query, ...params) as Array<{ id: string }>
  const goalId = result[0]?.id

  // -------------------------
  // Notifications for org users
  // -------------------------
  const notifQuery = `
    INSERT INTO notifications (user_id, org, title, message)
    SELECT id, org, $1, $2
    FROM pesuser
    WHERE org = (SELECT org FROM pesuser WHERE id = $3)
  `
  const title = `New Goal Created: ${entry.name}`
  const message = `${entry.description} (Due: ${entry.due_date})`
  await prisma.$queryRawUnsafe(notifQuery, title, message, entry.user_id)

  // -------------------------
  // Update org table
  // -------------------------
  const orgResult = await prisma.$queryRawUnsafe<{ name: string; evaluation: string[]; ongoing: boolean }[]>(
    `SELECT name, evaluation, ongoing FROM org WHERE name = (SELECT org FROM pesuser WHERE id = $1)`,
    entry.user_id
  )

  if (orgResult.length > 0) {
    const orgName = orgResult[0].name
    const evaluations = orgResult[0].evaluation || []

    // Append the new evaluation type if not already present
    const updatedEvaluations = evaluations.includes(entry.evaluation_type)
      ? evaluations
      : [...evaluations, entry.evaluation_type]

    await prisma.$queryRawUnsafe(
      `UPDATE org SET evaluation = $1, ongoing = true, updated_at = NOW() WHERE name = $2`,
      updatedEvaluations,
      orgName
    )
  }

  await prisma.$disconnect()
  return { message: 'success', status: 200, goalId }
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  if (data) {
    try {
      const goals = await updateData(data)
      return NextResponse.json(goals)
    } catch (err) {
      console.error(err)
      return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
    }
  }

  return NextResponse.redirect(new URL('/not-found', request.url))
}
