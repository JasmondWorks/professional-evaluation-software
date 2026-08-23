import { NextResponse } from 'next/server';
import { respondToHod } from '@/app/lib/performance/service';
import { fail, viewerFrom } from '../_auth';

/** The staff member accepts or rejects. They are prompted on every objection,
 *  in band or out, so that being asked reveals nothing about the band. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    return NextResponse.json(
      await respondToHod(viewer, {
        entryId: Number(body.entryId),
        criterion: body.criterion,
        accepted: Boolean(body.accepted),
      }),
    );
  } catch (err) { return fail(err); }
}
