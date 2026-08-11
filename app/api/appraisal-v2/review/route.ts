import { NextResponse } from 'next/server';
import { recordHodScore } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

/** The HOD's counter-score plus mandatory justification. The response says only
 *  that it was recorded — never whether it fell inside the tolerance band. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    return NextResponse.json(await recordHodScore(viewer, body));
  } catch (err) { return fail(err); }
}
