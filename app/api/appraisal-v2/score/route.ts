// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { recordCategoryScore, submitEntry } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    // The response is redacted: quality comes back, worth/quantity/observed do not.
    return NextResponse.json({ score: await recordCategoryScore(viewer, body) });
  } catch (err) { return fail(err); }
}

export async function PATCH(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const { entryId } = await req.json();
    await submitEntry(viewer, Number(entryId));
    return NextResponse.json({ submitted: true });
  } catch (err) { return fail(err); }
}
