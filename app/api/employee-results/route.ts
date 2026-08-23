// Every result PES holds for one employee, for the employee record's
// "Performance analysis" tab.
//
// POST { id } → { appraisal, performance, stress, stressScores }
//
// Anything with no submission comes back as null so the UI can show an honest
// empty state instead of rendering zeros as real scores. All lookups are scoped
// to the caller's org and keyed by the staff member's name + department, which
// is how the appraisal/performance/stress tables reference a person.

import { NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';
import { onePerformance } from '@/app/lib/performance/results';

const num = (v: any): number | null =>
  v === null || v === undefined ? null : Number(v);

export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {
    anyOf: [
      'can_access_employee_data',
      'can_define_performance_metrics',
      'can_manage_performance_reviews',
    ],
  });
  if (!auth.ok) return auth.response;

  const org = auth.user.org;
  if (!org) return NextResponse.json({ error: 'Missing organization on your account.' }, { status: 400 });

  const { id } = await req.json().catch(() => ({ id: null }));
  const numericId = Number(id);
  if (!numericId || Number.isNaN(numericId)) {
    return NextResponse.json({ error: 'A staff id is required.' }, { status: 400 });
  }

  try {
    const staff = await prisma.pesuser.findFirst({
      where: { id: numericId, org },
      select: { id: true, name: true, dept: true },
    });
    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found in your organization.' }, { status: 404 });
    }

    const byName = { pesuser_name: staff.name, org };

    const [appraisal, performance, stress, stressScores] = await Promise.all([
      prisma.appraisal.findFirst({ where: byName, orderBy: { id: 'desc' } }),
      onePerformance(org, staff.name),
      prisma.stress.findFirst({ where: byName, orderBy: { id: 'desc' } }),
      prisma.stress_scores.findFirst({
        where: { user_name: staff.name, org },
        orderBy: { id: 'desc' },
      }),
    ]);

    return NextResponse.json({
      staff: { id: staff.id, name: staff.name, dept: staff.dept },
      appraisal: appraisal
        ? {
            teaching: num(appraisal.teaching_quality_evaluation),
            research: num(appraisal.research_quality_evaluation),
            administrative: num(appraisal.administrative_quality_evaluation),
            community: num(appraisal.community_quality_evaluation),
            other: num(appraisal.other_relevant_information),
            dept: appraisal.dept,
            pending: appraisal.pending === true,
          }
        : null,
      // The four criteria as settled, plus the fifth result and its grading.
      // Previously the raw `userperformance` row, which had no overall at all.
      performance: performance
        ? {
            competence: performance.competence,
            integrity: performance.integrity,
            compatibility: performance.compatibility,
            use_of_resources: performance.use_of_resources,
            overall: performance.overall,
            rtp: performance.rtp,
            grade: performance.grade,
            class_rank: performance.class_rank,
            descriptive: performance.descriptive,
            partial: performance.partial,
            dept: performance.dept,
            pending: performance.status === 'awaiting_staff',
          }
        : null,
      stress: stress
        ? {
            theme: stress.stress_theme,
            feeling_frequency: stress.stress_feeling_frequency,
            category: stress.stress_category,
            theme_form: stress.stress_theme_form,
            feeling_frequency_form: stress.stress_feeling_frequency_form,
            dept: stress.dept,
            cycle_id: stress.cycle_id,
            hod_approved: stress.hod_approved,
            approved: stress.approved,
            rejected: stress.rejected,
            rejection_reason: stress.rejection_reason,
            approved_at: stress.approved_at,
          }
        : null,
      // Form 5 category scores — the staff member's own reported stress load.
      stressScores: stressScores
        ? {
            dept: stressScores.dept,
            cycle_id: stressScores.cycle_id,
            categories: [
              { label: 'Organizational', value: num(stressScores.organizational) },
              { label: 'Student', value: num(stressScores.student) },
              { label: 'Administrative', value: num(stressScores.administrative) },
              { label: 'Teacher', value: num(stressScores.teacher) },
              { label: 'Parents', value: num(stressScores.parents) },
              { label: 'Occupational', value: num(stressScores.occupational) },
              { label: 'Personal', value: num(stressScores.personal) },
              { label: 'Academic programme', value: num(stressScores.academic_program) },
              { label: 'Negative public attitude', value: num(stressScores.negative_public_attitude) },
              { label: 'Miscellaneous', value: num(stressScores.misc) },
            ],
          }
        : null,
    });
  } catch (err) {
    console.error('employee-results error:', err);
    return NextResponse.json({ error: 'Failed to load results.' }, { status: 500 });
  }
}
