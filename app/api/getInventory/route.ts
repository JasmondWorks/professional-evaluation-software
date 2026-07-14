import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'


async function getInventory( user: string | null ) {
  if (!user) return []
  return prisma.facilities.findMany({ where: { org: user } })
}

export async function POST(request: NextRequest) {
  // The client posts the decoded token; facilities are scoped by org (not name).
  const body = await request.json();
  const org = body?.org ?? body?.name;

  if (org) {
    try {
      const userInfo = await getInventory(org)
      return NextResponse.json(userInfo)
    } catch(err) {
      console.error(err)
      return NextResponse.json([])
    }
  }
  return NextResponse.json([])
}