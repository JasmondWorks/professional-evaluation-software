// Auth is read from the request headers, so this can never be statically rendered.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { ORG_ADMIN_ROLES } from '@/app/lib/performance/instrument';
import { performanceOverview } from '@/app/lib/performance/results';
import { fail, viewerFrom } from '../_auth';

/** The organization-wide performance figures behind the dashboard card. Admin
 *  only: it aggregates every staff member's result, released or not. */
export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    if (!ORG_ADMIN_ROLES.includes(viewer.role)) {
      return NextResponse.json({ error: 'Not available for this account.' }, { status: 403 });
    }
    return NextResponse.json({ overview: await performanceOverview(viewer.org) });
  } catch (err) { return fail(err); }
}
