// Auth is read from the request headers, so this can never be statically rendered.
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { closePeriod, currentPeriod, openPeriod, releaseResults } from '@/app/lib/performance/service';
import { fail, viewerFrom } from '../_auth';

/** The open period for this org, if there is one. */
export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    return NextResponse.json({ period: await currentPeriod(viewer.org) });
  } catch (err) { return fail(err); }
}

/** Open a period, or close or release one. Closing also runs the draw for who
 *  scores each head. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();

    if (body.action === 'close') {
      return NextResponse.json(await closePeriod(viewer, Number(body.periodId)));
    }
    if (body.action === 'release') {
      return NextResponse.json(await releaseResults(viewer, Number(body.periodId)));
    }

    return NextResponse.json(
      await openPeriod(viewer, {
        frequency: body.frequency,
        startsOn: new Date(body.startsOn),
        endsOn: new Date(body.endsOn),
        target: body.target === undefined ? undefined : Number(body.target),
        raterSample: body.raterSample === undefined ? undefined : Number(body.raterSample),
        raterMinimum: body.raterMinimum === undefined ? undefined : Number(body.raterMinimum),
      }),
    );
  } catch (err) { return fail(err); }
}
