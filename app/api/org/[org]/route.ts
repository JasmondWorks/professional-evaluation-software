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

    return NextResponse.json({
      status: 200,
      data: org
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { status: 500, message: 'Failed to fetch org' },
      { status: 500 }
    )
  }
}

