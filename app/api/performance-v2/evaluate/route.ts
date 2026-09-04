// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { evaluateEntry, evaluatePeriod } from '@/app/lib/performance/service';
import { fail, viewerFrom } from '../_auth';

/** Run the evaluation: the four criteria, the overall as their mean, then RTP
 *  against the period's target and the grade. One entry, or the whole period
 *  including every head's own result. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    if (body.entryId) {
      return NextResponse.json(await evaluateEntry(viewer, Number(body.entryId)));
    }
    return NextResponse.json(await evaluatePeriod(viewer, Number(body.periodId)));
  } catch (err) { return fail(err); }
}
