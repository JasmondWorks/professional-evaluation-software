// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { submitEntry } from '@/app/lib/performance/service';
import { fail, viewerFrom } from '../_auth';

/** Seal the entry. All four criteria must be present, since the overall is
 *  their mean. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    return NextResponse.json({ entry: await submitEntry(viewer, Number(body.entryId)) });
  } catch (err) { return fail(err); }
}
