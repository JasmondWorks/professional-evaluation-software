// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { closePeriod, currentPeriod, openPeriod } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    return NextResponse.json({ period: await currentPeriod(viewer.org) });
  } catch (err) { return fail(err); }
}

export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const { frequency, startsOn, endsOn } = await req.json();
    const period = await openPeriod(viewer, {
      frequency, startsOn: new Date(startsOn), endsOn: new Date(endsOn),
    });
    return NextResponse.json({ period });
  } catch (err) { return fail(err); }
}

export async function PATCH(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const { periodId } = await req.json();
    await closePeriod(viewer, Number(periodId));
    return NextResponse.json({ closed: true });
  } catch (err) { return fail(err); }
}
