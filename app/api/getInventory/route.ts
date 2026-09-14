// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'


async function getInventory( orgId: number | null ) {
  if (!orgId) return []
  return prisma.facilities.findMany({ where: { org_id: orgId } })
}

// Facilities for an organization. The client posted the org it wanted, which is
// to say anyone could post any org and read its inventory.
export async function POST(request: NextRequest) {
  const auth = authorize(tokenFromRequest(request), {});
  if (!auth.ok) return auth.response;

  const orgId = auth.user.orgId ?? null;

  if (orgId) {
    try {
      const userInfo = await getInventory(orgId)
      return NextResponse.json(userInfo)
    } catch(err) {
      console.error(err)
      return NextResponse.json([])
    }
  }
  return NextResponse.json([])
}