import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pesuser_name, org, competence, integrity, compatibility, use_of_resources } = body

    // Required fields
    if (!pesuser_name || !org) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Fetch dept from pesuser
    const userResult = await prisma.$queryRawUnsafe<{ dept: string }[]>(
      `SELECT dept FROM "pesuser" WHERE name = $1 AND org = $2 LIMIT 1`,
      pesuser_name,
      org
    )

    if (userResult.length === 0 || !userResult[0].dept) {
      return NextResponse.json({ message: 'User not found or department missing' }, { status: 404 })
    }

    const dept = userResult[0].dept

    // Insert or update into userperformance
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "userperformance" (pesuser_name, org, dept, competence, integrity, compatibility, use_of_resources)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (pesuser_name, org, dept)
      DO UPDATE SET
        competence = EXCLUDED.competence,
        integrity = EXCLUDED.integrity,
        compatibility = EXCLUDED.compatibility,
        use_of_resources = EXCLUDED.use_of_resources
      `,
      pesuser_name,
      org,
      dept,
      competence ?? null,
      integrity ?? null,
      compatibility ?? null,
      use_of_resources ?? null
    )

    return NextResponse.json({ message: 'userperformance saved/updated' }, { status: 200 })
  } catch (error) {
    console.error('Prisma query error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
