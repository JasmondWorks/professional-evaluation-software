import { NextResponse } from 'next/server';
import { outstandingSubmissions } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

/** Who has not yet submitted, by department. Required by the model for both the
 *  HOD (their own department) and Estab./Personnel (every department). */
export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const periodId = Number(new URL(req.url).searchParams.get('periodId'));
    return NextResponse.json({ departments: await outstandingSubmissions(viewer, periodId) });
  } catch (err) { return fail(err); }
}
