// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import type { Prisma } from '@prisma/client'
import { authorize, tokenFromRequest } from '../_lib/authGuard'

async function getUser(userNameOrEmail: string | null, userId: string | null) {
  if (!userNameOrEmail && userId === null) {
    return null
  }

  // An id claim, when present, identifies the account exactly — name and
  // email are not unique (two real accounts can share a display name, e.g.
  // the same person's org-admin account and a separate auditor account), so
  // OR-ing them in alongside id let `findFirst` return a DIFFERENT person's
  // row whenever a name collided, with no `orderBy` to make that outcome even
  // deterministic. Only fall back to name/email at all when there's no id to
  // go on — a legacy token that predates the userID claim.
  const or: Prisma.pesuserWhereInput[] = userId !== null
    ? [{ id: userId }]
    : userNameOrEmail
      ? [{ name: userNameOrEmail }, { email: userNameOrEmail }]
      : [];

  try {
    // Never select `password`. This row is returned straight to the browser, and
    // the navbar and sidebar now request it on every page, so the hash would
    // otherwise be sent over the wire constantly.
    return await prisma.pesuser.findFirst({
      where: { OR: or },
      select: {
        id: true, name: true, email: true, gsm: true, role: true,
        display_role: true, address: true, faculty_college: true,
        dob: true, doa: true, poa: true, doc: true, post: true, dopp: true,
        level: true, image: true, org_id: true, dept: true, tier: true,
        category: true, plan: true,
      },
    })
  } catch (err) {
    console.error('Error fetching user in getUser:', err)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(request), {});
    if (!auth.ok) return auth.response;

    const decoded = auth.user;

    let identifier: string | null = null;
    let userId: string | null = null;

    if (decoded && typeof decoded === 'object') {
      // Direct fields
      if ('name' in decoded && typeof decoded.name === 'string') {
        identifier = decoded.name;
      } else if ('email' in decoded && typeof decoded.email === 'string') {
        identifier = decoded.email;
      }

      if ('userID' in decoded && typeof decoded.userID === 'string') {
        userId = decoded.userID;
      } else if ('id' in decoded && typeof decoded.id === 'string') {
        userId = decoded.id;
      }

      // Check nested "sub" claim
      if ('sub' in decoded) {
        const sub = decoded.sub;
        if (typeof sub === 'object' && sub !== null) {
          if ('name' in sub && typeof (sub as any).name === 'string') {
            identifier = (sub as any).name;
          } else if ('email' in sub && typeof (sub as any).email === 'string') {
            identifier = (sub as any).email;
          } else if ('user_id' in sub && typeof (sub as any).user_id === 'string') {
            // A UUID string; we can try matching it as a general identifier.
            userId = (sub as any).user_id;
          }
        } else if (typeof sub === 'string') {
          identifier = sub;
        }
      }
    }

    const userInfo = await getUser(identifier, userId)

    if (!userInfo) {
      return NextResponse.json(null)
    }
    
    return NextResponse.json(userInfo)

  } catch(err) {
    console.error(err)
    return NextResponse.json({ data: ['no data'] })
  }    
}