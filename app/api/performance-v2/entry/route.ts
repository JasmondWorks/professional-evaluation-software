// Auth is read from the request headers, so this can never be statically rendered.
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { ensureEntry, getEntry, listEntries } from '@/app/lib/performance/service';
import { fail, viewerFrom } from '../_auth';

/** One entry by id, or everyone in a period. Staff see themselves; heads see
 *  their department; the org admin sees the org. */
export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const url = new URL(req.url);
    const entryId = url.searchParams.get('entryId');
    if (entryId) return NextResponse.json({ entry: await getEntry(viewer, Number(entryId)) });

    const periodId = Number(url.searchParams.get('periodId'));
    return NextResponse.json({ entries: await listEntries(viewer, periodId) });
  } catch (err) { return fail(err); }
}

/** Find or create this staff member's entry in the open period. */
export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({ entry: await ensureEntry(viewer, body.pesuserName) });
  } catch (err) { return fail(err); }
}
