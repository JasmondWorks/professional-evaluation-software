// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyEntry } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

/** The departmental administrator confirms Forms 8 and 9 match the paper
 *  originals. Nothing reaches the head of department until this happens. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const { entryId, note } = await req.json();
    return NextResponse.json({ entry: await verifyEntry(viewer, { entryId: Number(entryId), note }) });
  } catch (err) { return fail(err); }
}
