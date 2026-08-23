import { NextResponse } from 'next/server';
import { recordCriterion } from '@/app/lib/performance/service';
import { fail, viewerFrom } from '../_auth';

/** Record one criterion's 1-10 ratings. The server normalises to 100 — the
 *  browser's arithmetic is never trusted. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    return NextResponse.json({
      score: await recordCriterion(viewer, {
        entryId: Number(body.entryId),
        criterion: body.criterion,
        ratings: (body.ratings ?? []).map(Number),
      }),
    });
  } catch (err) { return fail(err); }
}
