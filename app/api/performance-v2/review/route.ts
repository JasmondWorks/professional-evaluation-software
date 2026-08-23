import { NextResponse } from 'next/server';
import { recordHodScore } from '@/app/lib/performance/service';
import { fail, viewerFrom } from '../_auth';

/** The head's objection: their own score plus a mandatory written reason. The
 *  response says only that it was recorded — never whether it fell inside the
 *  tolerance band. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    return NextResponse.json(
      await recordHodScore(viewer, {
        entryId: Number(body.entryId),
        criterion: body.criterion,
        hodScore: Number(body.hodScore),
        justification: body.justification ?? '',
      }),
    );
  } catch (err) { return fail(err); }
}
