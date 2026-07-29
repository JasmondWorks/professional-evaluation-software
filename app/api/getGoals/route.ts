import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'

// Goals are set by the organization's admin and apply to the WHOLE org, so every
// user in that org must see them — not just the admin who created them. Goals are
// stored against the creator's user_id (no org column), so we resolve the org's
// member ids and return goals created by any of them. Falls back to the caller's
// own goals only when the org can't be determined.
async function getData(org: string | null, fallbackUserId: string | null) {
  if (org) {
    const orgUsers = await prisma.pesuser.findMany({
      where: { org },
      select: { id: true },
    })
    const ids = orgUsers.map((u) => String(u.id))
    if (ids.length) {
      return prisma.goals.findMany({ where: { user_id: { in: ids } } })
    }
  }
  if (fallbackUserId) {
    return prisma.goals.findMany({ where: { user_id: fallbackUserId } })
  }
  return []
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let payload = body;
    
    // Check if token wrapper exists
    if (body && typeof body === 'object' && 'token' in body && typeof body.token === 'string') {
      const decoded = jwt.decode(body.token);
      if (decoded && typeof decoded === 'object') {
        payload = decoded;
      }
    }

    let userIdentifier: string | null = null;
    if (payload && typeof payload === 'object') {
      // Direct properties
      if ('userID' in payload && payload.userID !== undefined && payload.userID !== null) {
        userIdentifier = String(payload.userID);
      } else if ('id' in payload && payload.id !== undefined && payload.id !== null) {
        userIdentifier = String(payload.id);
      } else if ('name' in payload && payload.name !== undefined && payload.name !== null) {
        userIdentifier = String(payload.name);
      } else if ('email' in payload && payload.email !== undefined && payload.email !== null) {
        userIdentifier = String(payload.email);
      }

      // Check sub claim
      if (!userIdentifier && 'sub' in payload) {
        const sub = payload.sub;
        if (typeof sub === 'object' && sub !== null) {
          if ('user_id' in sub && (sub as any).user_id !== undefined && (sub as any).user_id !== null) {
            userIdentifier = String((sub as any).user_id);
          } else if ('name' in sub && (sub as any).name !== undefined && (sub as any).name !== null) {
            userIdentifier = String((sub as any).name);
          } else if ('email' in sub && (sub as any).email !== undefined && (sub as any).email !== null) {
            userIdentifier = String((sub as any).email);
          }
        } else if (typeof sub === 'string') {
          userIdentifier = sub;
        }
      }
    }

    // The org the caller belongs to — goals are shared across the whole org.
    let org: string | null = null;
    if (payload && typeof payload === 'object') {
      if ('org' in payload && payload.org) org = String(payload.org);
      else if ('sub' in payload && payload.sub && typeof payload.sub === 'object' && 'org' in (payload.sub as any)) {
        org = String((payload.sub as any).org);
      }
    }

    if (!org && !userIdentifier) {
      console.warn("Could not find org or user identifier in token:", body);
    }

    const goals = await getData(org, userIdentifier);
    return NextResponse.json(goals);
  } catch(err) {
    console.error(err);
    return NextResponse.json([]);
  }
}