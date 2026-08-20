import { NextResponse } from 'next/server';
import prisma from '@/app/api/prisma.dev';
import { assertModelMatches, ensureEntry, expectedModelFor, listEntries, redactCategory, redactEntry, redactFlag } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const url = new URL(req.url);
    const periodId = url.searchParams.get('periodId');

    // Listing mode: everyone being appraised in a period.
    if (periodId && !url.searchParams.get('entryId')) {
      return NextResponse.json({ entries: await listEntries(viewer, Number(periodId)) });
    }

    const entryId = Number(url.searchParams.get('entryId'));

    const entry = await prisma.appraisal_entry.findFirst({
      where: { id: entryId, org: viewer.org },
      include: { categories: true },
    });
    if (!entry) return NextResponse.json({ error: 'Appraisal not found.' }, { status: 404 });

    // Opening an entry by id bypassed ensureEntry entirely, so a wrongly
    // modelled row stayed reachable by direct link.
    assertModelMatches(entry, await expectedModelFor(viewer, entry.pesuser_name ?? ''));

    // Staff see nothing until the period closes: with forms 11 and 12 being
    // self-entered, live results would let an appraisee probe the worth table.
    const period = await prisma.appraisal_period.findUnique({ where: { id: entry.period_id } });
    const sealed = period?.status === 'open' && viewer.name === entry.pesuser_name;

    const shaped = redactFlag(redactEntry(entry), viewer);
    return NextResponse.json({
      entry: {
        ...shaped,
        rtp: sealed ? null : shaped.rtp,
        grade: sealed ? null : shaped.grade,
        categories: entry.categories.map(redactCategory),
      },
      sealed,
    });
  } catch (err) { return fail(err); }
}

export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();
    return NextResponse.json({ entry: redactEntry(await ensureEntry(viewer, body)) });
  } catch (err) { return fail(err); }
}
