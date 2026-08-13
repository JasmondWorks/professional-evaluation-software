import { NextResponse } from 'next/server';
import { questionnaireFor, saveQuestionnaire } from '@/app/lib/appraisal/service';
import { fail, viewerFrom } from '../_auth';

export async function GET(req: Request) {
  const model = new URL(req.url).searchParams.get('model');
  return NextResponse.json({ items: questionnaireFor(model === 'academic' ? 'academic' : 'non_academic') });
}

export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const { entryId, answers } = await req.json();
    await saveQuestionnaire(viewer, { entryId: Number(entryId), answers });
    return NextResponse.json({ saved: true });
  } catch (err) { return fail(err); }
}
