// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { departmentAdminStatus } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

/** Does this department have someone who can record Forms 8 and 9? */
export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const dept = new URL(req.url).searchParams.get('dept');
    return NextResponse.json(await departmentAdminStatus(viewer, dept));
  } catch (err) { return fail(err); }
}
