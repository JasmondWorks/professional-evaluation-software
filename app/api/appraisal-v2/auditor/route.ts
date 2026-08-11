import { NextResponse } from 'next/server';
import { auditorQueue, recordAuditorScore } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    return NextResponse.json({ referred: await auditorQueue(viewer) });
  } catch (err) { return fail(err); }
}

export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    return NextResponse.json(await recordAuditorScore(viewer, body));
  } catch (err) { return fail(err); }
}
