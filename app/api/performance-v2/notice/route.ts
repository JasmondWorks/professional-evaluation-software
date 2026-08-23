// Auth is read from the request headers, so this can never be statically rendered.
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { performanceNotice } from '@/app/lib/performance/service';
import { fail, viewerFrom } from '../_auth';

/** What this person has to do about performance right now, for the banner. */
export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    return NextResponse.json(await performanceNotice(viewer));
  } catch (err) { return fail(err); }
}
