// Who has won what under the appraisal motivation scheme — and, on POST,
// writing in every award the engine can decide on its own.
//
// Assembles each staff member's released appraisal — overall grade, and the
// score and grade in each category — and hands it to the engine, which decides
// the competitive awards ("highest Excellent score in Research from each
// Faculty") that cannot be worked out from one person's result alone.

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';
import { appraisalEligibility } from '@/app/lib/motivation/appraisalEligibility';

export async function GET(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;
    const orgId = auth.user?.orgId ?? null;
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found in token' }, { status: 400 });
    }

    const { periods, period, staff, outcomes } = await appraisalEligibility(String(orgId));
    return NextResponse.json({
      periods,
      period: period ? { id: period.id, starts_on: period.starts_on, ends_on: period.ends_on } : null,
      staff: staff.length,
      outcomes,
    });
  } catch (error) {
    console.error('Error determining appraisal awards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** Write in every award the engine can decide on its own — every winner of a
 *  non-manual rule, from the same eligibility GET just computed. The "manual"
 *  awards (Author of the Year, promotions, gifts, training, finance — the ones
 *  the engine itself says it cannot decide) are untouched; those still go
 *  through the free-form "Record an award" form.
 *
 *  Safe to run twice: a winner already recorded for this period and award is
 *  skipped rather than duplicated. There is no unique index backing that on
 *  motivation_award (unlike hall_of_fame/first_book_of_record), so the check
 *  is a read before the write rather than relying on a constraint to catch it. */
export async function POST(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), { roles: ['admin', 'super-admin'] });
    if (!auth.ok) return auth.response;
    const orgId = auth.user?.orgId ?? null;
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found in token' }, { status: 400 });
    }

    const { period, outcomes } = await appraisalEligibility(String(orgId));
    if (!period) {
      return NextResponse.json({ error: 'No appraisal period has been released yet.' }, { status: 409 });
    }
    const periodLabel = String(new Date(period.ends_on).getFullYear());

    const existing = await prisma.motivation_award.findMany({
      where: { org_id: orgId, period_label: periodLabel },
      select: { staff_name: true, motivator: true },
    });
    const already = new Set(existing.map((a) => `${a.staff_name}::${a.motivator}`));

    const added: { name: string; award: string }[] = [];
    const skipped: { name: string; award: string }[] = [];

    for (const outcome of outcomes) {
      if (outcome.award.rule.kind === 'manual') continue; // the engine cannot decide these
      for (const winner of outcome.winners) {
        const key = `${winner.name}::${outcome.award.key}`;
        if (already.has(key)) {
          skipped.push({ name: winner.name, award: outcome.award.label });
          continue;
        }
        await prisma.motivation_award.create({
          data: {
            org_id: orgId,
            staff_name: winner.name,
            dept: winner.dept,
            period: 'annual',
            period_label: periodLabel,
            level: outcome.award.art ?? 'award',
            motivator: outcome.award.key,
            detail: `${outcome.award.label}${winner.scopeLabel ? ` — ${winner.scopeLabel}` : ''}`,
            awarded_by: auth.user?.email ? String(auth.user.email) : null,
          },
        });
        already.add(key);
        added.push({ name: winner.name, award: outcome.award.label });
      }
    }

    return NextResponse.json({ periodLabel, added, skipped });
  } catch (error) {
    console.error('Error recording appraisal awards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
