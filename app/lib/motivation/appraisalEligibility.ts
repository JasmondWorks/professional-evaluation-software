// Builds the appraisal awards engine's inputs from the database, and runs it.
// Split out of app/api/appraisal-awards/route.ts so the eligibility report
// (read-only) and the promotion (which writes motivation_award rows) share the
// exact same reading of "who is eligible for what" — a promotion that worked
// from different data than the report an admin just reviewed would be the
// thing most likely to erode trust in this feature.

import prisma from '@/app/api/prisma.dev';
import {
  determineAwards,
  type AppraisalCategory,
  type AwardOutcome,
  type StaffResult,
} from './appraisalAwards';
import { levelFromPercentage, type PerformanceLevel } from './scheme';

const CATEGORIES: AppraisalCategory[] = ['teaching', 'research', 'administration', 'community'];

/** Senior Lecturer and above counts as senior; everyone else junior. The table
 *  splits several awards this way and the cadre is recorded on the entry. */
function cadreOf(value: string | null): 'junior' | 'senior' | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (/prof|reader|senior/.test(v)) return 'senior';
  if (/assist|graduate|junior|lecturer\s*(i|ii|2|1)?$/.test(v)) return 'junior';
  return null;
}

export type AppraisalEligibility = {
  periods: number;
  period: { id: string; starts_on: Date; ends_on: Date } | null;
  staff: StaffResult[];
  outcomes: AwardOutcome[];
};

/** Everyone eligible for what, from the latest released appraisal period, and
 *  the engine's verdict on each award. Read-only — callers decide separately
 *  whether to write anything from it. */
export async function appraisalEligibility(orgId: string): Promise<AppraisalEligibility> {
  const periods = await prisma.appraisal_period.findMany({
    where: { org_id: orgId, released_at: { not: null } },
    orderBy: { ends_on: 'desc' },
    select: { id: true, starts_on: true, ends_on: true },
  });

  if (periods.length === 0) {
    return { periods: 0, period: null, staff: [], outcomes: determineAwards([], 0) };
  }

  const latest = periods[0];
  const entries = await prisma.appraisal_entry.findMany({
    where: { org_id: orgId, period_id: latest.id },
    select: {
      id: true, pesuser_name: true, dept: true, grade: true, rtp: true, cadre: true, position: true,
    },
  });

  const scores = await prisma.appraisal_category_score.findMany({
    where: { entry_id: { in: entries.map((e) => e.id) } },
    select: { entry_id: true, category: true, recorded_score: true, appraisal_score: true },
  });

  // Faculty lives on the staff record, not the entry, and half the awards are
  // scoped by it.
  const people = await prisma.pesuser.findMany({
    where: { org_id: orgId },
    select: { name: true, faculty_college: true },
  });
  const facultyOf = new Map(people.map((p) => [p.name, p.faculty_college ?? null]));

  const byEntry = new Map<string, typeof scores>();
  for (const s of scores) {
    byEntry.set(s.entry_id, [...(byEntry.get(s.entry_id) ?? []), s]);
  }

  // Streaks, for the Books of Records and the Hall of Fame: how many of the
  // most recent released periods in a row a person held a grade.
  const priorEntries = await prisma.appraisal_entry.findMany({
    where: { org_id: orgId, period_id: { in: periods.map((p) => p.id) } },
    select: { pesuser_name: true, period_id: true, grade: true },
  });
  const orderedPeriodIds = periods.map((p) => p.id);
  const gradesByPerson = new Map<string, Map<string, string | null>>();
  for (const e of priorEntries) {
    const m = gradesByPerson.get(e.pesuser_name) ?? new Map();
    m.set(e.period_id, e.grade);
    gradesByPerson.set(e.pesuser_name, m);
  }
  const streak = (name: string, grade: string): number => {
    const m = gradesByPerson.get(name);
    if (!m) return 0;
    let n = 0;
    for (const pid of orderedPeriodIds) {
      if (m.get(pid) === grade) n += 1;
      else break;
    }
    return n;
  };

  /** The same walk, but counting any year spent inside a band of grades. */
  const streakInBand = (name: string, grades: string[]): number => {
    const m = gradesByPerson.get(name);
    if (!m) return 0;
    let n = 0;
    for (const pid of orderedPeriodIds) {
      const g = m.get(pid);
      if (g != null && grades.includes(g)) n += 1;
      else break;
    }
    return n;
  };

  const staff: StaffResult[] = entries.map((e) => {
    const rows = byEntry.get(e.id) ?? [];
    const scoreMap: StaffResult['scores'] = {};
    const gradeMap: StaffResult['grades'] = {};
    for (const r of rows) {
      const key = r.category as AppraisalCategory;
      if (!CATEGORIES.includes(key)) continue;
      const value = r.recorded_score ?? r.appraisal_score;
      if (value == null) continue;
      const n = Number(value);
      scoreMap[key] = n;
      gradeMap[key] = levelFromPercentage(n);
    }

    return {
      name: e.pesuser_name,
      dept: e.dept,
      faculty: facultyOf.get(e.pesuser_name) ?? null,
      cadre: cadreOf(e.cadre ?? e.position ?? null),
      overallGrade: (e.grade as PerformanceLevel | null) ?? null,
      overallPercent: e.rtp == null ? null : Number(e.rtp),
      scores: scoreMap,
      grades: gradeMap,
      consecutiveVeryGood: streak(e.pesuser_name, 'Very Good'),
      consecutiveExcellent: streak(e.pesuser_name, 'Excellent'),
      consecutiveInBand: (grades) => streakInBand(e.pesuser_name, grades),
    };
  });

  // determineAwards is called here, on the server, precisely because the band
  // walk is a function on each result and would not survive JSON.
  const outcomes = determineAwards(staff, periods.length);

  return { periods: periods.length, period: latest, staff, outcomes };
}
