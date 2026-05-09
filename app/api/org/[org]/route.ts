import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'

export async function GET(
  req: Request,
  { params }: { params: { org: string } }
) {
  const orgName = decodeURIComponent(params.org)
  console.log("Fetching org:", orgName) 

  try {
    const org = await prisma.$queryRaw`
      SELECT
        id,
        name,
        evaluation,
        ongoing
      FROM org
      WHERE name = ${orgName}
      LIMIT 1;
    `
    console.log("Org fetched:", org)    

    if (!Array.isArray(org) || org.length === 0) {
      return NextResponse.json(
        { status: 404, message: 'Org not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 200,
      data: org[0]
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { status: 500, message: 'Failed to fetch org' },
      { status: 500 }
    )
  }
}

