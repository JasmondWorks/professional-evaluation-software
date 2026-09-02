import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'


async function getInventory( user: string | null ) {
  if (!user) return []
  return prisma.facilities.findMany({ where: { org: user } })
}

// Facilities for an organization. The client posted the org it wanted, which is
// to say anyone could post any org and read its inventory.
export async function POST(request: NextRequest) {
  const auth = authorize(tokenFromRequest(request), {});
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;

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