// The real head count at each management level, taken from the employee
// records.
//
// Section 21 compares the ideal number of managers a level should hold against
// the number the organization actually employs there. Those real numbers used
// to be typed in by hand, which meant a figure naming redundant posts could be
// moved by whoever typed it. The client asked for them to come from the
// employee records instead, so they come from here.

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';

export async function GET(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;

    const org = auth.user?.org ? String(auth.user.org) : null;
    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found in token' },
        { status: 400 },
      );
    }

    const rows = await prisma.pesuser.groupBy({
      by: ['management_level'],
      where: { org, management_level: { not: null } },
      _count: { _all: true },
    });

    const counts: Record<number, number> = {};
    for (const row of rows) {
      if (row.management_level == null) continue;
      counts[row.management_level] = row._count._all;
    }

    // How many records carry a level at all. A page showing zeros needs to be
    // able to say whether that means "nobody is a manager" or "nobody has been
    // given a level yet", and those are very different answers.
    const assigned = Object.values(counts).reduce((sum, n) => sum + n, 0);

    return NextResponse.json({ counts, assigned });
  } catch (error) {
    console.error('Error counting management levels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
