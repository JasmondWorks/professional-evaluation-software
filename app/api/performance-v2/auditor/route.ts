// Auth is read from the request headers, so this can never be statically rendered.
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { auditorQueue, recordAuditorScore } from '@/app/lib/performance/service';
import { fail, viewerFrom } from '../_auth';

/** Everything still awaiting the external auditor's ruling. */
export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    return NextResponse.json({ queue: await auditorQueue(viewer) });
  } catch (err) { return fail(err); }
}

/** The auditor's figure is final. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    return NextResponse.json(
      await recordAuditorScore(viewer, {
        entryId: Number(body.entryId),
        criterion: body.criterion,
        score: Number(body.score),
        note: body.note,
      }),
    );
  } catch (err) { return fail(err); }
}
