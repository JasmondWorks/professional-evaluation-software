// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { addCourse, listCourses, removeCourse } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const periodId = Number(new URL(req.url).searchParams.get('periodId'));
    return NextResponse.json({ courses: await listCourses(viewer, periodId) });
  } catch (err) { return fail(err); }
}

export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    return NextResponse.json({ course: await addCourse(viewer, await req.json()) });
  } catch (err) { return fail(err); }
}

export async function DELETE(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const id = Number(new URL(req.url).searchParams.get('id'));
    await removeCourse(viewer, id);
    return NextResponse.json({ removed: true });
  } catch (err) { return fail(err); }
}
