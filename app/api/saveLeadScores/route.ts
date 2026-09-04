// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';
import { validateData, leadScoresSchema, formatZodErrors } from '@/app/lib/validation';

// Table: lead_scores (pesuser_name, dept, competence, integrity, compatibility, use_of_resources)

// Scoring a lead. lead_scores is keyed on (pesuser_name, dept) alone, with no
// org column, so an unauthenticated caller could overwrite the scores of a
// same-named lead in any organization. Scoring is a supervisory act, so it needs
// the capability, not merely a session.
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {
    anyOf: ['can_manage_performance_reviews'],
    roles: ['hod', 'unit-head'],
  });
  if (!auth.ok) return auth.response;

  try {
    const parsed = validateData(leadScoresSchema, await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(parsed.errors!) },
        { status: 400 },
      );
    }
    const { pesuser_name, dept, scores } = parsed.data!;
    // Upsert the lead's scores
    const values = {
      competence: scores.competence ?? null,
      integrity: scores.integrity ?? null,
      compatibility: scores.compatibility ?? null,
      use_of_resources: scores.use_of_resources ?? null,
    };
    await prisma.lead_scores.upsert({
      where: { pesuser_name_dept: { pesuser_name, dept } },
      update: values,
      create: { pesuser_name, dept, ...values },
    });
    return NextResponse.json({ message: 'Lead scores saved' }, { status: 200 });
  } catch (error) {
    console.error('Error saving lead scores:', error);
    return NextResponse.json({ error: 'Failed to save lead scores' }, { status: 500 });
  }
}
