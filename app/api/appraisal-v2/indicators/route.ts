import { NextResponse } from 'next/server';
import { listIndicators, setIndicators } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const url = new URL(req.url);
    const periodId = Number(url.searchParams.get('periodId'));
    const who = url.searchParams.get('pesuserName') ?? viewer.name;
    return NextResponse.json({ indicators: await listIndicators(viewer, periodId, who) });
  } catch (err) { return fail(err); }
}

export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    return NextResponse.json({ indicators: await setIndicators(viewer, await req.json()) });
  } catch (err) { return fail(err); }
}
