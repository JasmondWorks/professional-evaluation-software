// Auth is read from the request headers, so this can never be statically rendered.
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { hodResults } from '@/app/lib/performance/service';
import { fail, viewerFrom } from '../_auth';

/** A head's own aggregated result. Individual returns are never exposed, and the
 *  figure is withheld entirely below the minimum number of returns. */
export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const periodId = Number(new URL(req.url).searchParams.get('periodId'));
    return NextResponse.json({ results: await hodResults(viewer, periodId) });
  } catch (err) { return fail(err); }
}
