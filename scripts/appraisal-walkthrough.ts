/**
 * Appraisal flow walkthrough.
 *
 *   npx tsx scripts/appraisal-walkthrough.ts
 *
 * Drives one complete appraisal from opening a period to a final grade, against
 * the local database, printing what each role does and what they are allowed to
 * see. There is no UI for this flow yet, so this script is how you watch it work.
 *
 * It creates a throwaway organization (__walkthrough__) and deletes it at the
 * end, so it will not touch real data.
 */

import { PrismaClient } from '@prisma/client';
import {
  closePeriod,
  ensureEntry,
  evaluateEntry,
  openPeriod,
  recordAuditorScore,
  recordCategoryScore,
  recordHodScore,
  respondToHod,
  setTarget,
  submitEntry,
  listEntries,
  releaseResults,
  Viewer,
} from '../app/lib/appraisal/service';
import { ACADEMIC_FORMS } from '../app/lib/appraisal/instrument';

const prisma = new PrismaClient();
const ORG = '__walkthrough__';

const admin: Viewer = { org: ORG, name: 'Estab Officer', role: 'admin', dept: 'Mechanical Engineering' };
const hod: Viewer = { org: ORG, name: 'Prof. Head', role: 'hod', dept: 'Mechanical Engineering' };
// Records Forms 8 and 9 from paper. A different person from the HOD, who scores.
const deptAdmin: Viewer = { org: ORG, name: 'Dept Officer', role: 'dept-admin', dept: 'Mechanical Engineering' };
const staff: Viewer = { org: ORG, name: 'Dr. Adeolla', role: 'lecturer', dept: 'Mechanical Engineering' };
const auditor: Viewer = { org: ORG, name: 'External Auditor', role: 'auditor' };

let step = 0;
const say = (who: string, what: string) => console.log(`\n${String(++step).padStart(2, '0')}. [${who}]  ${what}`);
const show = (label: string, value: unknown) => console.log(`      ${label}: ${JSON.stringify(value)}`);
const expect = (label: string, got: unknown, want: unknown) => {
  const pass = JSON.stringify(got) === JSON.stringify(want);
  console.log(`      ${pass ? 'as expected' : '>>> UNEXPECTED'}  ${label}: got ${JSON.stringify(got)}${pass ? '' : `, expected ${JSON.stringify(want)}`}`);
};

async function cleanup() {
  const periods = await prisma.appraisal_period.findMany({ where: { org: ORG }, select: { id: true } });
  for (const p of periods) await prisma.appraisal_period.delete({ where: { id: p.id } });
}

async function main() {
  await cleanup();

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Opens the appraisal period. This is the root of everything.');
  const period = await openPeriod(admin, {
    frequency: 'yearly',
    startsOn: new Date('2026-01-01'),
    endsOn: new Date('2026-12-31'),
  });
  show('period id', period.id);
  show('status', period.status);
  const seeded = await prisma.appraisal_target.count({ where: { org: ORG, period_id: period.id } });
  show('targets seeded automatically', seeded);

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Tries to open a second period while one is open.');
  try {
    await openPeriod(admin, { frequency: 'quarterly', startsOn: new Date('2026-02-01'), endsOn: new Date('2026-04-30') });
    console.log('      >>> UNEXPECTED: a second period was allowed');
  } catch (e: any) {
    expect('refused', e.message, 'An appraisal period is already open. Close it before opening another.');
  }

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Adjusts the Teaching target for Lecturer I. Forms 8 and 9 both count towards it.');
  await setTarget(admin, {
    periodId: period.id, model: 'academic', position: 'lecturer_i',
    category: 'teaching', target: 192,
  });
  show('teaching target for Lecturer I', 192);

  // -------------------------------------------------------------------------
  say('Estab./Personnel', 'Creates the appraisal record for a Lecturer I.');
  const entry = await ensureEntry(admin, {
    pesuserName: staff.name, model: 'academic', position: 'lecturer_i', dept: 'Mechanical Engineering',
  });
  show('entry id', entry.id);
  expect('status', entry.status, 'draft');

  // -------------------------------------------------------------------------
  say('Appraisee', 'Tries to enter the student evaluation form. Should be refused.');
  try {
    await recordCategoryScore(staff, { entryId: entry.id, category: 'student_evaluation' as const, lineItems: [] });
    console.log('      >>> UNEXPECTED: appraisee was allowed to enter Form 8');
  } catch (e: any) {
    expect('refused', e.message.includes('recorded by the departmental administrator'), true);
  }

  // -------------------------------------------------------------------------
  say('HOD', 'Tries to record Form 8. Should be refused: that is the departmental administrator.');
  try {
    await recordCategoryScore(hod, { entryId: entry.id, category: 'student_evaluation' as const, lineItems: [] });
    console.log('      >>> UNEXPECTED: the HOD recorded a departmental form');
  } catch (e: any) {
    expect('refused', e.message.includes('recorded by the departmental administrator'), true);
  }

  // -------------------------------------------------------------------------
  say('Organization admin', 'Tries to enter a form. Should be refused: admins never input data.');
  try {
    await recordCategoryScore(admin, { entryId: entry.id, category: 'research' as const, lineItems: [5] });
    console.log('      >>> UNEXPECTED: the organization admin was allowed to enter data');
  } catch (e: any) {
    expect('refused', e.message.includes('does not enter appraisal data'), true);
  }

  // -------------------------------------------------------------------------
  say('Departmental administrator', 'Submits only 8 student evaluation copies for a 40-student course.');
  const form8 = ACADEMIC_FORMS.find(f => f.key === 'student_evaluation')!;
  const goodCopy = form8.items.map(i => Math.round(i.max * 0.7));   // ~70%
  try {
    await recordCategoryScore(deptAdmin, {
      entryId: entry.id, category: 'student_evaluation' as const, lineItems: [],
      copies: Array(8).fill(goodCopy), studentCount: 40, basicUnits: 3,
    });
    console.log('      >>> UNEXPECTED: 8 copies were accepted');
  } catch (e: any) {
    expect('blocked, and says how many are needed', e.message.includes('needs 10 completed'), true);
    console.log(`      message: "${e.message}"`);
  }

  // -------------------------------------------------------------------------
  say('Departmental administrator', 'Submits 10 copies. Recorded result is their mean.');
  const s8 = await recordCategoryScore(deptAdmin, {
    entryId: entry.id, category: 'student_evaluation' as const, lineItems: [],
    copies: Array(10).fill(goodCopy), studentCount: 40, basicUnits: 3,
  });
  show('quality recorded', Number(s8.quality));
  expect('worth withheld from response', 'worth' in s8, false);
  expect('quantity withheld from response', 'quantity' in s8, false);

  // -------------------------------------------------------------------------
  say('Departmental administrator', 'Enters the teaching quality form (Form 9). Adds into the same Teaching category as Form 8.');
  const form9 = ACADEMIC_FORMS.find(f => f.key === 'teaching_quality')!;
  await recordCategoryScore(deptAdmin, {
    entryId: entry.id, category: 'teaching_quality' as const,
    lineItems: form9.items.map(i => Math.round(i.max * 0.75)),
    evidence: [{ ruleKey: 'theoretical_teaching', measure: 45, scripts: 40 }],
  });
  show('Form 8 and Form 9 both feed', 'teaching');

  // -------------------------------------------------------------------------
  say('Appraisee', 'Enters the research form (Form 10) with evidence.');
  const form10 = ACADEMIC_FORMS.find(f => f.key === 'research')!;
  const s10 = await recordCategoryScore(staff, {
    entryId: entry.id, category: 'research' as const,
    lineItems: form10.items.map(i => Math.round(i.max * 0.8)),   // ~80%
    evidence: [{ ruleKey: 'monograph_technical', measure: 120 }],
  });
  show('quality recorded', Number(s10.quality));

  // -------------------------------------------------------------------------
  say('Appraisee', 'Submits. The entry locks.');
  await submitEntry(staff, entry.id);
  try {
    await recordCategoryScore(staff, { entryId: entry.id, category: 'community' as const, lineItems: [50] });
    console.log('      >>> UNEXPECTED: a locked entry accepted an edit');
  } catch (e: any) {
    expect('locked', e.message.includes('can no longer be edited'), true);
  }

  // -------------------------------------------------------------------------
  say('Organization admin', 'Runs the evaluation.');
  const evaluated: any = await evaluateEntry(admin, entry.id);
  show('RTP', evaluated.rtp === null ? null : Number(evaluated.rtp).toFixed(2));
  show('grade', evaluated.grade);
  expect('total_observed withheld', 'total_observed' in evaluated, false);
  show('partial_target (some category had no target)', evaluated.partial_target);

  // -------------------------------------------------------------------------
  say('HOD', 'Disagrees on research and records a counter-score with justification.');
  const noJust = await recordHodScore(hod, {
    entryId: entry.id, category: 'research' as const, hodScore: 55,
    justification: 'Evidence submitted does not support the depth claimed.',
  }).then(() => 'recorded').catch((e: any) => e.message);
  show('response to HOD', noJust);
  console.log('      note: the HOD is told only that it was recorded, never whether it fell inside the band');

  // -------------------------------------------------------------------------
  say('HOD', 'Tries to record a score with no justification.');
  try {
    await recordHodScore(hod, { entryId: entry.id, category: 'student_evaluation' as const, hodScore: 60, justification: '  ' });
    console.log('      >>> UNEXPECTED: allowed without justification');
  } catch (e: any) {
    expect('refused', e.message.includes('justification is required'), true);
  }

  // -------------------------------------------------------------------------
  say('Appraisee', 'Contests the adjustment.');
  const response = await respondToHod(staff, { entryId: entry.id, category: 'research' as const, accepted: false });
  show('outcome', response);
  const afterReject = await prisma.appraisal_entry.findUnique({ where: { id: entry.id } });
  expect('status', afterReject?.status, 'referred_to_auditor');
  expect('flagged', afterReject?.flagged, true);
  const heldRow = await prisma.appraisal_category_score.findFirst({ where: { entry_id: entry.id, category: 'research' } });
  expect('score held out of results (recorded_score null)', heldRow?.recorded_score, null);

  // -------------------------------------------------------------------------
  say('Auditor', 'Sees the referred case and rules on it.');
  const referred = await prisma.appraisal_entry.findMany({
    where: { org: ORG, status: 'referred_to_auditor' }, select: { id: true, pesuser_name: true },
  });
  show('referred to auditor', referred);
  await recordAuditorScore(auditor, { entryId: entry.id, category: 'research' as const, score: 68, note: 'Split the difference after review.' });
  const afterAudit = await prisma.appraisal_entry.findUnique({ where: { id: entry.id } });
  expect('flag cleared', afterAudit?.flagged, false);
  expect('status', afterAudit?.status, 'hod_reviewed');

  // -------------------------------------------------------------------------
  say('Organization admin', 'Re-evaluates with the auditor figure, then closes the period.');
  const final: any = await evaluateEntry(admin, entry.id);
  show('RTP', final.rtp === null ? null : Number(final.rtp).toFixed(2));
  show('grade', final.grade);
  // Staff must not see a grade before release.
  const beforeRelease = await listEntries(staff, period.id);
  expect('staff sees no grade while unreleased', beforeRelease[0].grade, null);

  await closePeriod(admin, period.id);
  const closed = await prisma.appraisal_period.findUnique({ where: { id: period.id } });
  expect('period status', closed?.status, 'closed');

  // -------------------------------------------------------------------------
  say('Organization admin', 'Releases the results. This is what staff finally see.');
  await releaseResults(admin, period.id);
  const afterRelease = await listEntries(staff, period.id);
  show('grade now visible to staff', afterRelease[0].grade);
  expect('grade released', afterRelease[0].grade !== null, true);

  // -------------------------------------------------------------------------
  say('Organization admin', 'Tries to release a second time.');
  try {
    await releaseResults(admin, period.id);
    console.log('      >>> UNEXPECTED: released twice');
  } catch (e: any) {
    expect('refused', e.message, 'Results are already released.');
  }

  console.log('\n      The appraisal has ended: the period is closed and the results are released.');

  await cleanup();
  console.log('\nWalkthrough complete. Test organization removed.\n');
}

main()
  .catch((e) => { console.error('\nWALKTHROUGH FAILED:', e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
