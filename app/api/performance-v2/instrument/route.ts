// Auth is read from the request headers, so this can never be statically rendered.
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { CRITERIA, HOD_CRITERIA, PERFORMANCE_TARGET, PERFORMANCE_CLASSES, RATING_MAX, RATING_MIN } from '@/app/lib/performance/instrument';
import { GRADE_BANDS } from '@/app/lib/performance/scoring';
import { fail, viewerFrom } from '../_auth';

/** The form definitions, so the screens and the server can never disagree about
 *  which work parameters exist or what they are worth. The tolerance band is
 *  deliberately NOT here — it stays unknown to staff and heads. */
export async function GET(req: Request) {
  try {
    viewerFrom(req);
    return NextResponse.json({
      criteria: CRITERIA,
      hodCriteria: HOD_CRITERIA,
      target: PERFORMANCE_TARGET,
      ratingMin: RATING_MIN,
      ratingMax: RATING_MAX,
      gradeBands: GRADE_BANDS,
      classes: PERFORMANCE_CLASSES,
    });
  } catch (err) { return fail(err); }
}
