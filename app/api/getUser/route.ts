import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import type { Prisma } from '@prisma/client'
import { authorize, tokenFromRequest } from '../_lib/authGuard'

async function getUser(userNameOrEmail: string | null, userId: number | null) {
  if (!userNameOrEmail && userId === null) {
    return null
  }

  const or: Prisma.pesuserWhereInput[] = []

  if (userNameOrEmail) {
    or.push({ name: userNameOrEmail }, { email: userNameOrEmail })
  }

  if (userId !== null && !isNaN(userId)) {
    or.push({ id: userId })
  }

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
        level: true, image: true, org: true, dept: true, tier: true,
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
    let userId: number | null = null;

    if (decoded && typeof decoded === 'object') {
      // Direct fields
      if ('name' in decoded && typeof decoded.name === 'string') {
        identifier = decoded.name;
      } else if ('email' in decoded && typeof decoded.email === 'string') {
        identifier = decoded.email;
      }

      if ('userID' in decoded && (typeof decoded.userID === 'number' || typeof decoded.userID === 'string')) {
        userId = Number(decoded.userID);
      } else if ('id' in decoded && (typeof decoded.id === 'number' || typeof decoded.id === 'string')) {
        userId = Number(decoded.id);
      }

      // Check nested "sub" claim
      if ('sub' in decoded) {
        const sub = decoded.sub;
        if (typeof sub === 'object' && sub !== null) {
          if ('name' in sub && typeof (sub as any).name === 'string') {
            identifier = (sub as any).name;
          } else if ('email' in sub && typeof (sub as any).email === 'string') {
            identifier = (sub as any).email;
          } else if ('user_id' in sub && (typeof (sub as any).user_id === 'number' || typeof (sub as any).user_id === 'string')) {
            const subUserId = Number((sub as any).user_id);
            if (!isNaN(subUserId)) {
              userId = subUserId;
            } else if (typeof (sub as any).user_id === 'string') {
              // If it's a UUID string, we can try matching it as a general identifier
              identifier = (sub as any).user_id;
            }
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