// Reads the caller's token, so this can never be a static route.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { authorize, tokenFromRequest } from '../_lib/authGuard';
import {
  RecordsError,
  promoteForWindow,
  windowStandings,
} from '@/app/lib/motivation/records';

function viewerFrom(user: any) {
  return {
    orgId: String(user.orgId),
    role: String(user.role),
    name: user.name ? String(user.name) : '',
  };
}

/** Who would be promoted, without writing anything.
 *
 *  Separate from the POST deliberately: the promotion is visible to every
 *  member of staff the moment it lands, and an admin should be able to see the
 *  three-year standings the rule is about to act on before committing to them. */
export async function GET(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), { roles: ['admin', 'super-admin'] });
    if (!auth.ok) return auth.response;

    const user: any = auth.user;
    if (!user.orgId) {
      return NextResponse.json({ error: 'Your account has no organization.' }, { status: 400 });
    }

    const summary = await windowStandings(String(user.orgId));
    if (!summary) {
      return NextResponse.json({
        window: null,
        message: 'No released performance results yet.',
        standings: [],
      });
    }

    return NextResponse.json(summary);
  } catch (err: any) {
    if (err instanceof RecordsError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('motivation-records preview failed:', err);
    return NextResponse.json({ error: 'Could not read the standings.' }, { status: 500 });
  }
}

/** Run the promotion for the current three-year window. Idempotent. */
export async function POST(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), { roles: ['admin', 'super-admin'] });
    if (!auth.ok) return auth.response;

    const user: any = auth.user;
    if (!user.orgId) {
      return NextResponse.json({ error: 'Your account has no organization.' }, { status: 400 });
    }

    const result = await promoteForWindow(viewerFrom(user));
    return NextResponse.json(result);
  } catch (err: any) {
    if (err instanceof RecordsError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('motivation-records promotion failed:', err);
    return NextResponse.json({ error: 'The records could not be awarded.' }, { status: 500 });
  }
}
