// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { appraisalNotice } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

/** What this person needs to know about appraisal right now, written for their
 *  role. Polled by the dashboard banner. */
export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    return NextResponse.json(await appraisalNotice(viewer));
  } catch (err) { return fail(err); }
}
