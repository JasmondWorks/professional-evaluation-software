import { NextResponse } from 'next/server';
import prisma from '@/app/api/prisma.dev';
import { setTarget } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const periodId = Number(new URL(req.url).searchParams.get('periodId'));
    const targets = await prisma.appraisal_target.findMany({
      where: { org: viewer.org, period_id: periodId },
      orderBy: [{ model: 'asc' }, { position: 'asc' }, { category: 'asc' }],
    });
    return NextResponse.json({ targets });
  } catch (err) { return fail(err); }
}

/** Fills the two gaps the source document left: the student evaluation target,
 *  and the non-academic cadre scheme. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    return NextResponse.json({ target: await setTarget(viewer, body) });
  } catch (err) { return fail(err); }
}
