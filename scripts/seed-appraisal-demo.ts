/**
 * Seeds a demo appraisal so the departmental, HOD and Dean screens can be seen
 * with real data.
 *
 *   npx tsx scripts/seed-appraisal-demo.ts
 *
 * Creates an org "__demo__" with one of each role and an appraisal part-way
 * through, so every stage of the flow has something to show.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  openPeriod, ensureEntry, recordCategoryScore, submitEntry, verifyEntry, Viewer,
} from '../app/lib/appraisal/service';
import { ACADEMIC_FORMS } from '../app/lib/appraisal/instrument';

const prisma = new PrismaClient();
const ORG = '__demo__';
const DEPT = 'Mechanical Engineering';
const PASSWORD = 'Demo1234!';

const admin: Viewer = { org: ORG, name: 'Demo Estab', role: 'admin', dept: DEPT };
const deptAdmin: Viewer = { org: ORG, name: 'Demo Dept Officer', role: 'dept-admin', dept: DEPT };
const staff: Viewer = { org: ORG, name: 'Demo Lecturer', role: 'lecturer', dept: DEPT };

async function upsertUser(name: string, role: string, email: string) {
  const hash = await bcrypt.hash(PASSWORD, 10);
  const existing = await prisma.pesuser.findFirst({ where: { email } });
  if (existing) return existing;
  return prisma.pesuser.create({
    data: {
      name, email, password: hash, role, org: ORG, dept: DEPT,
      faculty_college: 'Engineering', gsm: '08000000000',
    },
  });
}

async function main() {
  for (const p of await prisma.appraisal_period.findMany({ where: { org: ORG } })) {
    await prisma.appraisal_period.delete({ where: { id: p.id } });
  }
  await prisma.pesuser.deleteMany({ where: { org: ORG } });
  await prisma.org.deleteMany({ where: { name: ORG } });

  await prisma.org.create({
    data: { name: ORG, category: 'academic', plan: 'premium', evaluation: [] },
  });
  await upsertUser(admin.name, 'admin', 'demo.admin@pes.test');
  await upsertUser(deptAdmin.name, 'dept-admin', 'demo.deptadmin@pes.test');
  await upsertUser('Demo Head', 'hod', 'demo.hod@pes.test');
  await upsertUser('Demo Dean', 'unit-head', 'demo.dean@pes.test');
  await upsertUser(staff.name, 'lecturer', 'demo.lecturer@pes.test');

  const period = await openPeriod(admin, {
    frequency: 'yearly', startsOn: new Date('2026-01-01'), endsOn: new Date('2026-12-31'),
  });
  const entry = await ensureEntry(admin, {
    pesuserName: staff.name, model: 'academic', position: 'lecturer_i', dept: DEPT,
  });

  const f8 = ACADEMIC_FORMS.find((f) => f.key === 'student_evaluation')!;
  const copy = f8.items.map((i) => Math.round(i.max * 0.8));
  await recordCategoryScore(deptAdmin, {
    entryId: entry.id, category: 'student_evaluation', lineItems: [],
    copies: Array(10).fill(copy), studentCount: 40, basicUnits: 3,
  });

  const f9 = ACADEMIC_FORMS.find((f) => f.key === 'teaching_quality')!;
  await recordCategoryScore(deptAdmin, {
    entryId: entry.id, category: 'teaching_quality',
    lineItems: f9.items.map((i) => Math.round(i.max * 0.75)),
    evidence: [{ ruleKey: 'theoretical_teaching', measure: 45, scripts: 40 }],
  });

  const f10 = ACADEMIC_FORMS.find((f) => f.key === 'research')!;
  await recordCategoryScore(staff, {
    entryId: entry.id, category: 'research',
    lineItems: f10.items.map((i) => Math.round(i.max * 0.85)),
    evidence: [{ ruleKey: 'monograph_technical', measure: 120 }],
  });

  await submitEntry(staff, entry.id);
  await verifyEntry(deptAdmin, { entryId: entry.id });

  console.log(`org      ${ORG}`);
  console.log(`period   ${period.id}`);
  console.log(`entry    ${entry.id} (verified, awaiting the head of department)`);
  console.log(`password ${PASSWORD} for every demo account`);
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
