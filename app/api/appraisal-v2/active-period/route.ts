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
