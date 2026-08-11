import { NextResponse } from 'next/server';
import { deanApproveDepartment } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const { periodId, dept } = await req.json();
    const result = await deanApproveDepartment(viewer, { periodId: Number(periodId), dept });
    return NextResponse.json({ approved: result.count });
  } catch (err) { return fail(err); }
}
