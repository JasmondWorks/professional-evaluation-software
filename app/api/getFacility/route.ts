// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { verifyToken } from "../_lib/authGuard";

async function getFacility( user: string | null ) {
  if (!user) return []
  return prisma.facilities.findMany({ where: { org: user } })
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.split(" ")[1];
  
  if (!token) {
    return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
  }

  let org;
  try {
    const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    org = decoded?.org;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  console.log('Fetched facility info:', org);

  if (org) {
    try {
        let userInfo = await getFacility(org)
        console.log('Fetched facility info:', userInfo);

        const classes = new Set<string>();
        userInfo.forEach(item => classes.add(item.description_of_facility));
        const stringArray = Array.from(classes);

        console.log(stringArray); // Output: ["boy", "girl", "neutral"]
        return NextResponse.json(stringArray)

    } catch(err) {
        console.error(err)
        return NextResponse.json([])
    }    
  }
  NextResponse.redirect(new URL('/not-found', request.url))
  return NextResponse.json([])
}