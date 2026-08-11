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
