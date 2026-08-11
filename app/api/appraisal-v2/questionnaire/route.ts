import { NextResponse } from 'next/server';
import { QUESTIONNAIRE_ITEMS, saveQuestionnaire } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

export async function GET() {
  return NextResponse.json({ items: QUESTIONNAIRE_ITEMS });
}

export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const { entryId, answers } = await req.json();
    await saveQuestionnaire(viewer, { entryId: Number(entryId), answers });
    return NextResponse.json({ saved: true });
  } catch (err) { return fail(err); }
}
