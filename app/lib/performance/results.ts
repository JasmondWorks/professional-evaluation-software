// Shared read layer over the performance model, for every screen that wants a
// staff member's four criteria without going through the workflow service.
//
// This exists because the rest of the app used to read `userperformance` and
// `counter_userperformance` directly: flat tables with one overwritten row per
// staff member, no period, no overall and no grade. Fifteen or so routes did
// that, each with its own idea of what a performance score was. They all come
// here now, so there is one answer to "what did this person score".
//
// Everything is org-scoped and drawn from the most recent period that has any
// entries, so a closed period keeps reporting until the next one produces data.

import prisma from '@/app/api/prisma.dev';
import { CRITERION_KEYS, CriterionKey, PERFORMANCE_TARGET } from './instrument';
import { scorePerformance } from './scoring';

export type StaffPerformance = {
  pesuser_name: string;
  dept: string | null;
  competence: number | null;
  integrity: number | null;
  compatibility: number | null;
  use_of_resources: number | null;
  /** The fifth result: the mean of whichever criteria are settled. */
  overall: number | null;
  rtp: number | null;
  grade: string | null;
  class_rank: string | null;
  descriptive: string | null;
  /** True when fewer than four criteria are settled. */
  partial: boolean;
  status: string;
  flagged: boolean;
  entry_id: number;
  period_id: number;
};

/** The period these figures should be read from: the newest one holding any
 *  entries for the org. Returns null when the org has never run one. */
export async function reportingPeriod(org: string) {
  const period = await prisma.performance_period.findFirst({
    where: { org, entries: { some: {} } },
    orderBy: { starts_on: 'desc' },
  });
  return period;
}

/** The figure a criterion contributes.
 *
 *  Precedence: the auditor's ruling is final; then the reconciled figure; then
 *  the staff member's own score where the head never objected. A criterion still
 *  in dispute returns null — held out rather than counted as zero, matching the
 *  workflow service. */
export function settledScore(row: {
  auditor_score?: any;
  recorded_score?: any;
  staff_score?: any;
  hod_score?: any;
  reconciliation?: string | null;
}): number | null {
  if (row.auditor_score !== null && row.auditor_score !== undefined) return Number(row.auditor_score);
  if (row.recorded_score !== null && row.recorded_score !== undefined) return Number(row.recorded_score);
  if (row.reconciliation === 'awaiting_staff_response' || row.reconciliation === 'referred_to_auditor') {
    return null;
  }
  if (row.hod_score !== null && row.hod_score !== undefined) return null;
  return row.staff_score === null || row.staff_score === undefined ? null : Number(row.staff_score);
}

type Filter = {
  org: string;
  dept?: string | null;
  names?: string[];
  /** Defaults to the reporting period. Pass a period to pin a historic cycle. */
  periodId?: number;
  /** Include entries still being drafted. Off by default, so half-finished
   *  ratings never surface as though they were results. */
  includeDrafts?: boolean;
};

/** Every staff member's four criteria plus their overall, for one org. */
export async function staffPerformance(filter: Filter): Promise<StaffPerformance[]> {
  const periodId = filter.periodId ?? (await reportingPeriod(filter.org))?.id;
  if (!periodId) return [];

  const entries = await prisma.performance_entry.findMany({
    where: {
      org: filter.org,
      period_id: periodId,
      ...(filter.dept ? { dept: filter.dept } : {}),
      ...(filter.names?.length ? { pesuser_name: { in: filter.names } } : {}),
      ...(filter.includeDrafts ? {} : { status: { not: 'draft' } }),
    },
    include: { criteria: true },
    orderBy: { pesuser_name: 'asc' },
  });

  const period = await prisma.performance_period.findUnique({ where: { id: periodId } });
  const target = Number(period?.target ?? PERFORMANCE_TARGET);

  return entries.map((entry) => {
    const byKey: Partial<Record<CriterionKey, number | null>> = {};
    for (const key of CRITERION_KEYS) {
      const row = entry.criteria.find((c) => c.criterion === key);
      byKey[key] = row ? settledScore(row) : null;
    }
    const outcome = scorePerformance(byKey, target);
    const scored = outcome.criteria.length > 0;

    return {
      pesuser_name: entry.pesuser_name,
      dept: entry.dept,
      competence: byKey.competence ?? null,
      integrity: byKey.integrity ?? null,
      compatibility: byKey.compatibility ?? null,
      use_of_resources: byKey.use_of_resources ?? null,
      overall: scored ? round2(outcome.overall) : null,
      rtp: outcome.rtp === null ? null : round2(outcome.rtp),
      grade: outcome.grade,
      class_rank: outcome.classification?.className ?? null,
      descriptive: outcome.classification?.descriptive ?? null,
      partial: outcome.partial,
      status: entry.status,
      flagged: entry.flagged,
      entry_id: entry.id,
      period_id: entry.period_id,
    };
  });
}

/** One staff member, or null when they have nothing in the reporting period. */
export async function onePerformance(
  org: string,
  pesuserName: string,
  periodId?: number,
): Promise<StaffPerformance | null> {
  const rows = await staffPerformance({ org, names: [pesuserName], periodId });
  return rows[0] ?? null;
}

/** The heads' counter-scores, in the same shape — the replacement for reads of
 *  `counter_userperformance`. Only criteria the head actually objected to carry
 *  a figure; the rest are null, because the head never gave one. */
export async function hodCounterScores(filter: Filter) {
  const periodId = filter.periodId ?? (await reportingPeriod(filter.org))?.id;
  if (!periodId) return [];

  const entries = await prisma.performance_entry.findMany({
    where: {
      org: filter.org,
      period_id: periodId,
      ...(filter.dept ? { dept: filter.dept } : {}),
      ...(filter.names?.length ? { pesuser_name: { in: filter.names } } : {}),
      criteria: { some: { hod_score: { not: null } } },
    },
    include: { criteria: { where: { hod_score: { not: null } } } },
    orderBy: { pesuser_name: 'asc' },
  });

  return entries.map((entry) => {
    const out: Record<string, any> = {
      pesuser_name: entry.pesuser_name,
      dept: entry.dept,
      competence: null,
      integrity: null,
      compatibility: null,
      use_of_resources: null,
    };
    for (const c of entry.criteria) out[c.criterion] = Number(c.hod_score);
    return out;
  });
}

/** Distinct staff who have submitted a performance record for the org. Used by
 *  the dashboard and assessment counters, which ask "who has returned
 *  anything". */
export async function performanceSubmitters(org: string): Promise<string[]> {
  const rows = await prisma.performance_entry.findMany({
    where: { org, status: { not: 'draft' } },
    select: { pesuser_name: true },
    distinct: ['pesuser_name'],
  });
  return rows.map((r) => r.pesuser_name);
}

/** How many staff have a performance record per department, for the coverage
 *  panels. */
export async function performanceCountsByDept(org: string) {
  const rows = await prisma.performance_entry.groupBy({
    by: ['dept'],
    where: { org, status: { not: 'draft' } },
    _count: { pesuser_name: true },
  });
  return rows.map((r) => ({ dept: r.dept, total_users: r._count.pesuser_name }));
}

/** Entries the organization admin has been asked to look at: a large gap between
 *  a staff member's score and their head's, or a referral to the auditor. The
 *  flag itself is admin-only — see the confidentiality note in the service. */
export async function flaggedPerformance(org: string) {
  const periodId = (await reportingPeriod(org))?.id;
  if (!periodId) return [];

  const entries = await prisma.performance_entry.findMany({
    where: {
      org,
      period_id: periodId,
      OR: [{ flagged: true }, { criteria: { some: { reconciliation: 'referred_to_auditor' } } }],
    },
    include: { criteria: true },
    orderBy: { pesuser_name: 'asc' },
  });

  return entries.map((entry) => ({
    pesuser_name: entry.pesuser_name,
    dept: entry.dept,
    status: entry.status,
    criteria: entry.criteria
      .filter((c) => c.hod_score !== null)
      .map((c) => ({
        criterion: c.criterion,
        staff_score: c.staff_score === null ? null : Number(c.staff_score),
        hod_score: c.hod_score === null ? null : Number(c.hod_score),
        hod_justification: c.hod_justification,
        staff_accepted: c.staff_accepted,
        reconciliation: c.reconciliation,
        auditor_score: c.auditor_score === null ? null : Number(c.auditor_score),
      })),
  }));
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}
