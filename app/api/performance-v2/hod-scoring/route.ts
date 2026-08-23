// Auth is read from the request headers, so this can never be statically rendered.
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { myHodAssignments, submitHodRating } from '@/app/lib/performance/service';
import { fail, viewerFrom } from '../_auth';

/** The heads this person was drawn to score, and whether they have done it. */
export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    return NextResponse.json({ assignments: await myHodAssignments(viewer) });
  } catch (err) { return fail(err); }
}

/** Return a score for a head on both criteria. Submitted once. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    await submitHodRating(viewer, {
      assignmentId: Number(body.assignmentId),
      management: (body.management ?? []).map(Number),
      productivity: (body.productivity ?? []).map(Number),
    });
    // The rater is told it was recorded, never what it produced.
    return NextResponse.json({ recorded: true });
  } catch (err) { return fail(err); }
}
