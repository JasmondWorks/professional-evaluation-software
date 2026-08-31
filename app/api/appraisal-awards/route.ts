// Who has won what under the appraisal motivation scheme.
//
// Assembles each staff member's released appraisal — overall grade, and the
// score and grade in each category — and hands it to the engine, which decides
// the competitive awards ("highest Excellent score in Research from each
// Faculty") that cannot be worked out from one person's result alone.

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, tokenFromRequest } from '../_lib/authGuard';
import { determineAwards, type StaffResult, type AppraisalCategory } from '@/app/lib/motivation/appraisalAwards';
import { levelFromPercentage, type PerformanceLevel } from '@/app/lib/motivation/scheme';

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

export async function GET(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;
    const org = auth.user?.org ? String(auth.user.org) : null;
    if (!org) {
      return NextResponse.json({ error: 'Organization not found in token' }, { status: 400 });
    }

    // Only released periods: an award drawn from results the staff have not
    // been shown would leak a grade before the admin meant to publish it.
    const periods = await prisma.appraisal_period.findMany({
      where: { org, released_at: { not: null } },
      orderBy: { ends_on: 'desc' },
      select: { id: true, starts_on: true, ends_on: true },
    });

    if (periods.length === 0) {
      return NextResponse.json({
        periods: 0,
        period: null,
        outcomes: determineAwards([], 0),
      });
    }

    const latest = periods[0];
    const entries = await prisma.appraisal_entry.findMany({
      where: { org, period_id: latest.id },
      select: {
        id: true,
        pesuser_name: true,
        dept: true,
        grade: true,
        rtp: true,
        cadre: true,
        position: true,
      },
    });

    const scores = await prisma.appraisal_category_score.findMany({
      where: { entry_id: { in: entries.map((e) => e.id) } },
      select: { entry_id: true, category: true, recorded_score: true, appraisal_score: true },
    });

    // Faculty lives on the staff record, not the entry, and half the awards are
    // scoped by it.
    const people = await prisma.pesuser.findMany({
      where: { org },
      select: { name: true, faculty_college: true },
    });
    const facultyOf = new Map(people.map((p) => [p.name, p.faculty_college ?? null]));

    const byEntry = new Map<number, typeof scores>();
    for (const s of scores) {
      byEntry.set(s.entry_id, [...(byEntry.get(s.entry_id) ?? []), s]);
    }

    // Streaks, for the Books of Records and the Hall of Fame: how many of the
    // most recent released periods in a row a person held a grade.
    const priorEntries = await prisma.appraisal_entry.findMany({
      where: { org, period_id: { in: periods.map((p) => p.id) } },
      select: { pesuser_name: true, period_id: true, grade: true },
    });
    const orderedPeriodIds = periods.map((p) => p.id);
    const gradesByPerson = new Map<string, Map<number, string | null>>();
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
      };
    });

    return NextResponse.json({
      periods: periods.length,
      period: { id: latest.id, starts_on: latest.starts_on, ends_on: latest.ends_on },
      staff: staff.length,
      outcomes: determineAwards(staff, periods.length),
    });
  } catch (error) {
    console.error('Error determining appraisal awards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
