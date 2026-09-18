// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { respondToHod } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

/** The appraisee accepts or contests. They are prompted on every HOD adjustment,
 *  in band or out, so that being asked reveals nothing about the band. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    return NextResponse.json(await respondToHod(viewer, body));
  } catch (err) { return fail(err); }
}
