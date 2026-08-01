import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'

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
    const auth = authorize(tokenFromRequest(request), {});
    if (!auth.ok) return auth.response;
    
    const user = auth.user;
    
    let userIdentifier: string | null = null;
    if (user.userID) userIdentifier = String(user.userID);
    else if (user.id) userIdentifier = String(user.id);
    else if (user.name) userIdentifier = String(user.name);
    else if (user.email) userIdentifier = String(user.email);
    else if (user.sub) {
      if (typeof user.sub === 'string') userIdentifier = user.sub;
      else if (typeof user.sub === 'object') {
        const sub = user.sub as any;
        userIdentifier = String(sub.user_id || sub.name || sub.email || '');
      }
    }

    const org = user.org ? String(user.org) : null;

    if (!org && !userIdentifier) {
      console.warn("Could not find org or user identifier in token");
    }

    const goals = await getData(org, userIdentifier);
    return NextResponse.json(goals);
  } catch(err) {
    console.error(err);
    return NextResponse.json([]);
  }
}