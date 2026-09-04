// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { releaseResults } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

/** Releasing is deliberate and separate from closing: it is the moment staff see
 *  their grade. Organization admin only. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const { periodId } = await req.json();
    return NextResponse.json({ period: await releaseResults(viewer, Number(periodId)) });
  } catch (err) { return fail(err); }
}
