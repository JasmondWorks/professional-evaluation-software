import { NextResponse } from 'next/server';
import { evaluateEntry } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const { entryId } = await req.json();
    return NextResponse.json({ entry: await evaluateEntry(viewer, Number(entryId)) });
  } catch (err) { return fail(err); }
}
