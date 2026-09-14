// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'


async function getUser( orgId: number | null ) {
  if (!orgId) return []
  return prisma.pesuser.findMany({ where: { org_id: orgId } })
}

export async function POST(request: NextRequest) {
  const auth = authorize(tokenFromRequest(request), {});
  if (!auth.ok) return auth.response;

  try {
    const userOrgId = auth.user.orgId ?? null;
    let userInfo = await getUser(userOrgId)
    return NextResponse.json(userInfo)
  } catch(err) {
    console.error(err)
    return NextResponse.json([])
  }    
}