export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'

export async function GET(
  req: Request,
  { params }: { params: { org: string } }
) {
  const orgName = decodeURIComponent(params.org)
  console.log("Fetching org:", orgName) 

  try {
    const org = await prisma.org.findUnique({
      where: { name: orgName },
      select: { id: true, name: true, evaluation: true, ongoing: true },
    })
    console.log("Org fetched:", org)

    if (!org) {
      return NextResponse.json(
        { status: 404, message: 'Org not found' },
        { status: 404 }
      )
    }

    const latestStressCycle = await prisma.stressCycle.findFirst({
      where: { org: orgName, phase: { not: 'evaluated' } },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      select: {
        settings_closes_at: true,
        feeling_closes_at: true,
        phase: true
      }
    })

    return NextResponse.json({
      status: 200,
      data: {
        ...org,
        stressCycle: latestStressCycle
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { status: 500, message: 'Failed to fetch org' },
      { status: 500 }
    )
  }
}

