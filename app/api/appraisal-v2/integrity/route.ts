// Auth is read from the request headers, so this can never be statically rendered.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { runAppraisalIntegrity } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

/** The data integrity test over one appraisal period, every department at once.
 *  Runs automatically after an evaluation, and on demand from the results tab. */
export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const periodId = Number(new URL(req.url).searchParams.get('periodId'));
    if (!Number.isFinite(periodId) || periodId <= 0) {
      return NextResponse.json({ error: 'A period is needed to run the test.' }, { status: 400 });
    }
    return NextResponse.json({ report: await runAppraisalIntegrity(viewer, periodId) });
  } catch (err) { return fail(err); }
}
