// Reads the caller's token, so this can never be a static route.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';

// What the /recognition hub needs to be worth visiting.
//
// The hub replaced three bare sidebar labels, and a page of three links would
// be a worse version of the rail it replaced. So it answers the two questions a
// label cannot: how many people are in each book, and whether the person
// reading is one of them. One request rather than four client-side fetches
// against the paginated book endpoints.
//
// Everything is org-scoped. The books and the Hall of Fame are shared surfaces
// within one organization, so a count is the organization's count, never the
// platform's.
export async function GET(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const user: any = auth.user;
  const orgId = user?.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'Your account has no organization.' }, { status: 400 });
  }

  // The viewer's own name, which is how these tables record a recipient — they
  // predate any user_id column and store `name`.
  const name = user?.name ? String(user.name) : null;

  try {
    const mine = name ? { org_id: orgId, name } : null;

    const [hofTotal, firstTotal, secondTotal, hofMine, firstMine, secondMine] =
      await Promise.all([
        prisma.hall_of_fame.count({ where: { org_id: orgId } }),
        prisma.first_book_of_record.count({ where: { org_id: orgId } }),
        prisma.second_book_of_record.count({ where: { org_id: orgId } }),
        mine ? prisma.hall_of_fame.count({ where: mine }) : Promise.resolve(0),
        mine ? prisma.first_book_of_record.count({ where: mine }) : Promise.resolve(0),
        mine ? prisma.second_book_of_record.count({ where: mine }) : Promise.resolve(0),
      ]);

    return NextResponse.json({
      hallOfFame: { total: hofTotal, includesMe: hofMine > 0 },
      firstBook: { total: firstTotal, includesMe: firstMine > 0 },
      secondBook: { total: secondTotal, includesMe: secondMine > 0 },
    });
  } catch (err) {
    console.error('recognition summary failed:', err);
    return NextResponse.json({ error: 'Could not load recognition.' }, { status: 500 });
  }
}
