/**
 * Seeds Hall of Fame, Books of Records, a certificate and a badge by driving
 * the real application flow — not direct inserts — so the screenshots match
 * what every role involved actually produces:
 *
 *   - three staff members run three years of the performance model
 *     (self-score -> submit -> admin evaluate/close/release), which is the
 *     only thing that can ever earn a place in the Hall of Fame or either
 *     Book of Records (`app/lib/motivation/records.ts`'s 3-year window);
 *     the admin then runs the same promotion the admin console does
 *     (`promoteForWindow`, the same call `POST /api/motivation-records` makes).
 *   - a fourth staff member runs one year of the appraisal model to an
 *     Excellent overall grade, which is the real precondition for a
 *     certificate/badge; the admin then records the award exactly as
 *     `POST /api/motivation-awards` does — that endpoint has no automatic
 *     trigger, an admin reading the eligibility report types this in by hand,
 *     so this call is the seed's stand-in for that person.
 *
 * Org logo / coat of arms: set directly on `org`, because the real route
 * (`POST /api/org-logo`) uploads to Cloudinary, which this script does not
 * assume is configured. Point LOGO_URL / COAT_OF_ARMS_URL at real images for
 * the screenshots to show marks; swap in Cloudinary URLs later if wanted.
 *
 *   npx tsx scripts/seed-awards-demo.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  openPeriod as openPerfPeriod,
  ensureEntry as ensurePerfEntry,
  recordCriterion,
  submitEntry as submitPerfEntry,
  evaluateEntry as evaluatePerfEntry,
  closePeriod as closePerfPeriod,
  releaseResults as releasePerfResults,
  Viewer as PerfViewer,
} from '../app/lib/performance/service';
import { CRITERION_KEYS, criterionDef } from '../app/lib/performance/instrument';
import { promoteForWindow } from '../app/lib/motivation/records';
import {
  openPeriod as openAppraisalPeriod,
  ensureEntry as ensureAppraisalEntry,
  recordCategoryScore,
  submitEntry as submitAppraisalEntry,
  verifyEntry,
  deanApproveDepartment,
  evaluateEntry as evaluateAppraisalEntry,
  closePeriod as closeAppraisalPeriod,
  releaseResults as releaseAppraisalResults,
  Viewer as AppraisalViewer,
} from '../app/lib/appraisal/service';
import { ACADEMIC_FORMS } from '../app/lib/appraisal/instrument';

const prisma = new PrismaClient();
const ORG = '__demo_awards__';
const DEPT = 'Mechanical Engineering';
const PASSWORD = 'Demo1234!';
const LOGO_URL = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
const COAT_OF_ARMS_URL = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

let ORG_ID = '';

const admin: PerfViewer & AppraisalViewer = { orgId: '', org: ORG, name: 'Demo Estab', role: 'admin', dept: DEPT };
const hod: PerfViewer = { orgId: '', org: ORG, name: 'Demo Head', role: 'hod', dept: DEPT };
const outstanding: PerfViewer = { orgId: '', org: ORG, name: 'Demo Outstanding Lecturer', role: 'lecturer', dept: DEPT };
const excellent: PerfViewer = { orgId: '', org: ORG, name: 'Demo Excellent Lecturer', role: 'lecturer', dept: DEPT };
const veryGood: PerfViewer = { orgId: '', org: ORG, name: 'Demo Very Good Lecturer', role: 'lecturer', dept: DEPT };
const appraisee: AppraisalViewer = { orgId: '', org: ORG, name: 'Demo Awarded Lecturer', role: 'lecturer', dept: DEPT };
const deptAdmin: AppraisalViewer = { orgId: '', org: ORG, name: 'Demo Dept Officer', role: 'dept-admin', dept: DEPT };
const dean: AppraisalViewer = { orgId: '', org: ORG, name: 'Demo Dean', role: 'dean', dept: DEPT };

async function upsertUser(name: string, role: string, email: string) {
  const hash = await bcrypt.hash(PASSWORD, 10);
  const existing = await prisma.pesuser.findFirst({ where: { email } });
  if (existing) return existing;
  return prisma.pesuser.create({
    data: {
      name, email, password: hash, role, org_id: ORG_ID, dept: DEPT,
      faculty_college: 'Engineering', gsm: '08000000000', category: 'academic',
    },
  });
}

/** Score every criterion for a staff member's performance entry at roughly
 *  `ratingOutOf10` across all 22 work parameters, then submit. */
async function runPerformanceEntry(staff: PerfViewer, ratingOutOf10: number) {
  const entry = await ensurePerfEntry(staff);
  for (const key of CRITERION_KEYS) {
    const ratings = criterionDef(key).parameters.map(() => ratingOutOf10);
    await recordCriterion(staff, { entryId: entry.id, criterion: key, ratings });
  }
  await submitPerfEntry(staff, entry.id);
  return entry;
}

/** One full performance period, start to release, for the three tracked staff. */
async function runPerformanceYear(startsOn: Date, endsOn: Date) {
  const period = await openPerfPeriod(admin, { frequency: 'yearly', startsOn, endsOn });

  const outstandingEntry = await runPerformanceEntry(outstanding, 10); // ~100% -> Very Outstanding
  const excellentEntry = await runPerformanceEntry(excellent, 8.5); // ~85% -> Excellent
  const veryGoodEntry = await runPerformanceEntry(veryGood, 7); // ~70% -> Very Good

  for (const entry of [outstandingEntry, excellentEntry, veryGoodEntry]) {
    await evaluatePerfEntry(admin, entry.id);
  }

  await closePerfPeriod(admin, period.id);
  await releasePerfResults(admin, period.id);
  return period;
}

/** One appraisal period, start to release, for the fourth staff member, scored
 *  to an overall Excellent grade — the real precondition for a certificate. */
async function runAppraisalYear() {
  const period = await openAppraisalPeriod(admin, {
    frequency: 'yearly', startsOn: new Date('2026-01-01'), endsOn: new Date('2026-12-31'),
  });
  const entry = await ensureAppraisalEntry(admin, {
    pesuserName: appraisee.name, model: 'academic', position: 'lecturer_i', dept: DEPT,
  });

  for (const key of ['student_evaluation', 'teaching_quality', 'research'] as const) {
    const form = ACADEMIC_FORMS.find((f) => f.key === key)!;
    const pct = 0.85; // Excellent band
    if (key === 'student_evaluation') {
      await recordCategoryScore(deptAdmin, {
        entryId: entry.id, category: key, lineItems: [],
        copies: Array(10).fill(form.items.map((i) => Math.round(i.max * pct))),
        studentCount: 40, basicUnits: 3,
      });
    } else {
      await recordCategoryScore(key === 'research' ? appraisee : deptAdmin, {
        entryId: entry.id, category: key,
        lineItems: form.items.map((i) => Math.round(i.max * pct)),
        evidence: [],
      });
    }
  }

  await submitAppraisalEntry(appraisee, entry.id);
  await verifyEntry(deptAdmin, { entryId: entry.id });
  await deanApproveDepartment(dean, { periodId: period.id, dept: DEPT });
  await evaluateAppraisalEntry(admin, entry.id);
  await closeAppraisalPeriod(admin, period.id);
  await releaseAppraisalResults(admin, period.id);
  return { period, entry };
}

/** Mirrors `POST /api/motivation-awards`: the admin manually recording an
 *  award after reading the eligibility report — there is no automatic path. */
async function recordMotivationAward(input: {
  staff: { id: string; name: string }; level: string; motivator: string; detail: string;
}) {
  return prisma.motivation_award.create({
    data: {
      org_id: ORG_ID,
      user_id: input.staff.id,
      staff_name: input.staff.name,
      dept: DEPT,
      period: '2026',
      period_label: '2026',
      level: input.level,
      motivator: input.motivator,
      detail: input.detail,
      awarded_by: admin.name,
    },
  });
}

async function main() {
  const existing = await prisma.org.findFirst({ where: { name: ORG }, select: { id: true } });
  if (existing) {
    await prisma.motivation_award.deleteMany({ where: { org_id: existing.id } });
    await prisma.hall_of_fame.deleteMany({ where: { org_id: existing.id } });
    await prisma.first_book_of_record.deleteMany({ where: { org_id: existing.id } });
    await prisma.second_book_of_record.deleteMany({ where: { org_id: existing.id } });
    await prisma.hod_performance_rater.deleteMany({ where: { org_id: existing.id } });
    await prisma.hod_performance_result.deleteMany({ where: { org_id: existing.id } });
    await prisma.performance_criterion_score.deleteMany({
      where: { entry: { org_id: existing.id } },
    });
    await prisma.performance_entry.deleteMany({ where: { org_id: existing.id } });
    for (const p of await prisma.performance_period.findMany({ where: { org_id: existing.id } })) {
      await prisma.performance_period.delete({ where: { id: p.id } });
    }
    await prisma.appraisal_evidence.deleteMany({ where: { entry: { org_id: existing.id } } });
    await prisma.appraisal_category_score.deleteMany({ where: { entry: { org_id: existing.id } } });
    await prisma.appraisal_entry.deleteMany({ where: { org_id: existing.id } });
    await prisma.appraisal_target.deleteMany({ where: { org_id: existing.id } });
    for (const p of await prisma.appraisal_period.findMany({ where: { org_id: existing.id } })) {
      await prisma.appraisal_period.delete({ where: { id: p.id } });
    }
    await prisma.pesuser.deleteMany({ where: { org_id: existing.id } });
  }
  await prisma.org.deleteMany({ where: { name: ORG } });

  const org = await prisma.org.create({
    data: {
      name: ORG, category: 'academic', plan: 'premium', evaluation: [],
      logo_url: LOGO_URL, coat_of_arms_url: COAT_OF_ARMS_URL,
    },
  });
  ORG_ID = org.id;
  for (const viewer of [admin, hod, outstanding, excellent, veryGood, appraisee, deptAdmin, dean]) {
    viewer.orgId = ORG_ID;
  }

  await upsertUser(admin.name, 'admin', 'demo.admin@pes.test');
  await upsertUser(hod.name, 'hod', 'demo.hod@pes.test');
  await upsertUser(outstanding.name, 'lecturer', 'demo.outstanding@pes.test');
  await upsertUser(excellent.name, 'lecturer', 'demo.excellent@pes.test');
  await upsertUser(veryGood.name, 'lecturer', 'demo.verygood@pes.test');
  const awardedUser = await upsertUser(appraisee.name, 'lecturer', 'demo.awarded@pes.test');
  await upsertUser(deptAdmin.name, 'dept-admin', 'demo.deptadmin@pes.test');
  await upsertUser(dean.name, 'unit-head', 'demo.dean@pes.test');

  console.log('Running 3 years of the performance model (Hall of Fame / Books of Records)...');
  const years = [
    [new Date('2023-01-01'), new Date('2023-12-31')],
    [new Date('2024-01-01'), new Date('2024-12-31')],
    [new Date('2025-01-01'), new Date('2025-12-31')],
  ] as const;
  for (const [startsOn, endsOn] of years) {
    await runPerformanceYear(startsOn, endsOn);
  }

  console.log('Promoting the 3-year window (same call as POST /api/motivation-records)...');
  const promotion = await promoteForWindow({ orgId: ORG_ID, role: admin.role, name: admin.name });
  console.log(promotion);

  console.log('Running one appraisal year to an Excellent grade (certificate/badge)...');
  await runAppraisalYear();

  console.log('Recording a certificate and a badge (same call as POST /api/motivation-awards)...');
  await recordMotivationAward({
    staff: awardedUser, level: 'cert-1st', motivator: 'cert-excellent-academician',
    detail: 'Annual overall grade of Excellent.',
  });
  await recordMotivationAward({
    staff: awardedUser, level: 'badge-1st', motivator: 'inst-excellent-teachers',
    detail: 'Highest "Excellent" score in Teaching from the Faculty.',
  });

  console.log(`\norg      ${ORG}`);
  console.log(`password ${PASSWORD} for every demo account`);
  console.log('hall of fame     -> Demo Outstanding Lecturer');
  console.log('1st book of rec. -> Demo Excellent Lecturer');
  console.log('2nd book of rec. -> Demo Very Good Lecturer');
  console.log('cert + badge     -> Demo Awarded Lecturer');
  console.log('\nVisit (as admin) /hall-of-fame, /reward/certificates/1st/Demo%20Awarded%20Lecturer,');
  console.log('/reward/badges/Demo%20Awarded%20Lecturer to screenshot each.');
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
