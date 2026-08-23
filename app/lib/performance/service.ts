// Performance service — the server-side orchestration between the pure scoring
// in ./scoring.ts and the database. SERVER ONLY.
//
// CONFIDENTIALITY CONTRACT, carried over from the appraisal model because the
// client asked for the same reconciliation here:
//   - The tolerance band must stay unknown to staff and to heads. A flag
//     surfaces only to the organization admin.
//   - A head never learns which of their staff were drawn to score them, and
//     never sees an individual return — only the aggregate, and only once the
//     minimum number of returns is in.
//
// Results stay sealed until the organization admin releases the period. A staff
// member who could resubmit and watch their own overall move could work out
// where the band sits, so an entry accepts edits only while it is a draft.

import prisma from '@/app/api/prisma.dev';
import {
  CRITERION_KEYS,
  CriterionKey,
  DEPARTMENT_SCOPED_ROLES,
  HEAD_ROLES,
  HOD_CRITERION_KEYS,
  HOD_RATER_MINIMUM,
  HOD_RATER_SAMPLE,
  HodCriterionKey,
  ORG_ADMIN_ROLES,
  PERFORMANCE_TARGET,
  criterionDef,
  hodCriterionDef,
  isHead,
} from './instrument';
import {
  criterionResult,
  hodCriterionResult,
  reconcile,
  scoreHod,
  scorePerformance,
} from './scoring';

export type Viewer = {
  org: string;
  name: string;
  role: string;
  dept?: string | null;
  productCategory?: string | null;
};

export class PerformanceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Periods
// ---------------------------------------------------------------------------

/** Open a performance period. Only the organization admin may do this, and only
 *  one may be open per org at a time so entries can never straddle two. */
export async function openPeriod(
  viewer: Viewer,
  input: { frequency: string; startsOn: Date; endsOn: Date; target?: number; raterSample?: number; raterMinimum?: number },
) {
  requireOrgAdmin(viewer);

  const open = await currentPeriod(viewer.org);
  if (open) throw new PerformanceError('A performance period is already open.', 409);
  if (input.endsOn <= input.startsOn) {
    throw new PerformanceError('The period must end after it starts.', 400);
  }

  const raterSample = input.raterSample ?? HOD_RATER_SAMPLE;
  const raterMinimum = input.raterMinimum ?? HOD_RATER_MINIMUM;
  if (raterMinimum > raterSample) {
    throw new PerformanceError(
      'The minimum number of returns cannot exceed the number of staff selected.',
      400,
    );
  }

  return prisma.performance_period.create({
    data: {
      org: viewer.org,
      frequency: input.frequency,
      starts_on: input.startsOn,
      ends_on: input.endsOn,
      opened_by: viewer.name,
      target: input.target ?? PERFORMANCE_TARGET,
      rater_sample: raterSample,
      rater_minimum: raterMinimum,
    },
  });
}

export async function currentPeriod(org: string) {
  return prisma.performance_period.findFirst({
    where: { org, status: 'open' },
    orderBy: { starts_on: 'desc' },
  });
}

/** Close a period. This ends data collection AND is the moment the client
 *  described as "at the end of this exercise": the draw for who scores each head
 *  happens here, once, so nobody can influence the sample by submitting late. */
export async function closePeriod(viewer: Viewer, periodId: number) {
  requireOrgAdmin(viewer);
  const period = await loadPeriod(viewer, periodId);
  if (period.status !== 'open') throw new PerformanceError('That period is not open.', 409);

  await prisma.performance_period.update({
    where: { id: period.id },
    data: { status: 'closed' },
  });

  const drawn = await drawHodRaters(viewer, period.id);
  return { closed: true, ...drawn };
}

/** Release results. Separate from closing, and restricted to the organization
 *  admin: closing ends collection, releasing is when staff finally see a grade. */
export async function releaseResults(viewer: Viewer, periodId: number) {
  requireOrgAdmin(viewer);
  const period = await loadPeriod(viewer, periodId);
  if (period.status !== 'closed') {
    throw new PerformanceError('Close the period before releasing results.', 409);
  }
  if (period.released_at) throw new PerformanceError('Results are already released.', 409);

  return prisma.performance_period.update({
    where: { id: period.id },
    data: { released_at: new Date(), released_by: viewer.name },
  });
}

// ---------------------------------------------------------------------------
// Entries and data collection
// ---------------------------------------------------------------------------

/** Find or create this staff member's entry in the open period.
 *
 *  A head of department gets one of these too. The client's instruction sets the
 *  head's own performance on the two criteria of pages 102-103, scored by their
 *  staff — but a head is also a member of staff, and nothing says they stop
 *  being assessed on the four. Both are recorded, and the two results are kept
 *  apart: `performance_entry` for the four, `hod_performance_result` for the
 *  two. Keeping both is the reversible choice — the head's four-criteria entry
 *  can be ignored later, whereas never collecting it cannot be undone. Flagged
 *  to the client. */
export async function ensureEntry(viewer: Viewer, pesuserName?: string) {
  const period = await currentPeriod(viewer.org);
  if (!period) throw new PerformanceError('No performance period is open.', 409);

  const name = pesuserName ?? viewer.name;
  if (name !== viewer.name && !DEPARTMENT_SCOPED_ROLES.includes(viewer.role) && !ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new PerformanceError('You can only open your own performance record.', 403);
  }

  const existing = await prisma.performance_entry.findFirst({
    where: { period_id: period.id, pesuser_name: name },
  });
  if (existing) return existing;

  const staff = await prisma.pesuser.findFirst({
    where: { name, org: viewer.org },
    select: { dept: true },
  });
  if (!staff) {
    throw new PerformanceError(`${name} is not on this organization's staff list.`, 404);
  }

  return prisma.performance_entry.create({
    data: {
      org: viewer.org,
      dept: staff.dept ?? null,
      period_id: period.id,
      pesuser_name: name,
    },
  });
}

/** An entry accepts edits only while it is a draft. Once submitted it is sealed:
 *  one submission gives one observation, not a probe at the tolerance band. */
function assertEntryOpen(entry: { status: string }) {
  if (entry.status !== 'draft') {
    throw new PerformanceError(
      'This performance record has been submitted and can no longer be edited.',
      409,
    );
  }
}

/** Refuse any rating outside the 1-10 scale printed beside it. The form clamps
 *  as you type, but the form can be bypassed by posting straight to the API. */
function assertRatings(criterion: CriterionKey, ratings: number[]) {
  const def = criterionDef(criterion);
  if (ratings.length !== def.parameters.length) {
    throw new PerformanceError(
      `${def.label} has ${def.parameters.length} work parameters, but ${ratings.length} ratings were sent.`,
      400,
    );
  }
  def.parameters.forEach((p, i) => {
    const raw = Number(ratings[i]);
    if (!Number.isFinite(raw)) {
      throw new PerformanceError(`"${p.label}" has not been rated.`, 400);
    }
    if (raw < 1 || raw > 10) {
      throw new PerformanceError(`"${p.label}" is rated from 1 to 10, but ${raw} was entered.`, 400);
    }
  });
}

/** Record one criterion's ratings and its result, normalised to 100. */
export async function recordCriterion(
  viewer: Viewer,
  input: { entryId: number; criterion: CriterionKey; ratings: number[] },
) {
  const entry = await loadEntry(viewer, input.entryId);
  assertEntryOpen(entry);

  if (ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new PerformanceError(
      'The organization administrator does not enter performance data. Open the period, then run and release the evaluation.',
      403,
    );
  }
  if (viewer.name !== entry.pesuser_name) {
    throw new PerformanceError('You can only enter your own performance criteria.', 403);
  }
  if (!CRITERION_KEYS.includes(input.criterion)) {
    throw new PerformanceError(`Unknown performance criterion: ${input.criterion}`, 400);
  }

  assertRatings(input.criterion, input.ratings);
  const score = criterionResult(input.criterion, input.ratings);

  const existing = await prisma.performance_criterion_score.findFirst({
    where: { entry_id: entry.id, criterion: input.criterion },
  });

  const data = { ratings: input.ratings, staff_score: score };
  const row = existing
    ? await prisma.performance_criterion_score.update({ where: { id: existing.id }, data })
    : await prisma.performance_criterion_score.create({
        data: { entry_id: entry.id, criterion: input.criterion, ...data },
      });

  await prisma.performance_entry.update({
    where: { id: entry.id },
    data: { updated_at: new Date() },
  });

  return row;
}

/** Seal the entry. All four criteria must be present: the overall is their mean,
 *  and a mean of two is not the result the client asked for. */
export async function submitEntry(viewer: Viewer, entryId: number) {
  const entry = await loadEntry(viewer, entryId);
  assertEntryOpen(entry);
  if (viewer.name !== entry.pesuser_name) {
    throw new PerformanceError('You can only submit your own performance record.', 403);
  }

  const scored = await prisma.performance_criterion_score.findMany({
    where: { entry_id: entry.id },
    select: { criterion: true },
  });
  const done = new Set(scored.map((s) => s.criterion));
  const missing = CRITERION_KEYS.filter((k) => !done.has(k));
  if (missing.length > 0) {
    throw new PerformanceError(
      `Complete every criterion before submitting. Still to do: ${missing
        .map((k) => criterionDef(k).label)
        .join(', ')}.`,
      400,
    );
  }

  return prisma.performance_entry.update({
    where: { id: entry.id },
    data: { status: 'submitted', submitted_at: new Date() },
  });
}

/** Everyone being assessed in a period, with just enough to drive a list.
 *  Grades stay hidden from staff and heads until results are released. */
export async function listEntries(viewer: Viewer, periodId: number) {
  const period = await loadPeriod(viewer, periodId);
  const isAdmin = ORG_ADMIN_ROLES.includes(viewer.role);
  const isDeptScoped = DEPARTMENT_SCOPED_ROLES.includes(viewer.role);

  const entries = await prisma.performance_entry.findMany({
    where: {
      org: viewer.org,
      period_id: periodId,
      ...(isAdmin ? {} : isDeptScoped ? { dept: viewer.dept } : { pesuser_name: viewer.name }),
    },
    include: { criteria: true },
    orderBy: { pesuser_name: 'asc' },
  });

  const released = Boolean(period.released_at);
  return entries.map((e) => presentEntry(e, viewer, released));
}

export async function getEntry(viewer: Viewer, entryId: number) {
  const entry = await loadEntry(viewer, entryId);
  const period = await loadPeriod(viewer, entry.period_id);
  const full = await prisma.performance_entry.findUnique({
    where: { id: entry.id },
    include: { criteria: true },
  });
  if (!full) throw new PerformanceError('Performance record not found.', 404);

  // A staff member sees their own record; a head sees their department's.
  const isAdmin = ORG_ADMIN_ROLES.includes(viewer.role);
  const isDeptScoped = DEPARTMENT_SCOPED_ROLES.includes(viewer.role);
  const mine = full.pesuser_name === viewer.name;
  if (!isAdmin && !mine && !(isDeptScoped && full.dept === viewer.dept)) {
    throw new PerformanceError('You cannot view that performance record.', 403);
  }

  return presentEntry(full, viewer, Boolean(period.released_at));
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

/** The five results: each criterion, then the overall as their mean, then RTP
 *  against the period's target and the grade that follows from it. */
export async function evaluateEntry(viewer: Viewer, entryId: number) {
  requireOrgAdmin(viewer);
  const entry = await loadEntry(viewer, entryId);
  const period = await loadPeriod(viewer, entry.period_id);
  const rows = await prisma.performance_criterion_score.findMany({ where: { entry_id: entry.id } });

  const results: Partial<Record<CriterionKey, number | null>> = {};
  for (const row of rows) {
    results[row.criterion as CriterionKey] = settledScore(row);
  }

  const outcome = scorePerformance(results, Number(period.target));

  const updated = await prisma.performance_entry.update({
    where: { id: entry.id },
    data: {
      overall: outcome.overall,
      target: outcome.target,
      rtp: outcome.rtp,
      grade: outcome.grade,
      class_rank: outcome.classification?.className ?? null,
      descriptive: outcome.classification?.descriptive ?? null,
      partial: outcome.partial,
      evaluated_at: new Date(),
      updated_at: new Date(),
    },
  });

  // Status follows from the rows, including whether anything is still referred.
  await refreshEntryStatus(entry.id);
  return { entry: updated, outcome };
}

/** Run the evaluation across the whole period. */
export async function evaluatePeriod(viewer: Viewer, periodId: number) {
  requireOrgAdmin(viewer);
  await loadPeriod(viewer, periodId);
  const entries = await prisma.performance_entry.findMany({
    where: { org: viewer.org, period_id: periodId },
    select: { id: true },
  });

  let evaluated = 0;
  for (const e of entries) {
    await evaluateEntry(viewer, e.id);
    evaluated += 1;
  }

  const heads = await evaluateAllHods(viewer, periodId);
  return { evaluated, heads };
}

/** The figure a criterion contributes to the overall.
 *
 *  Precedence: the auditor's ruling is final; otherwise the reconciled figure;
 *  otherwise the staff member's own score when the head never objected. A
 *  criterion still awaiting a response contributes nothing — it is held out of
 *  the mean rather than counted as zero. */
function settledScore(row: {
  auditor_score: any;
  recorded_score: any;
  staff_score: any;
  hod_score: any;
  reconciliation: string | null;
}): number | null {
  if (row.auditor_score !== null && row.auditor_score !== undefined) return Number(row.auditor_score);
  if (row.recorded_score !== null && row.recorded_score !== undefined) return Number(row.recorded_score);
  if (row.reconciliation === 'awaiting_staff_response' || row.reconciliation === 'referred_to_auditor') {
    return null;
  }
  if (row.hod_score !== null && row.hod_score !== undefined) return null;
  return row.staff_score === null || row.staff_score === undefined ? null : Number(row.staff_score);
}

// ---------------------------------------------------------------------------
// Reconciliation: the head objects, the staff member responds, the auditor rules
// ---------------------------------------------------------------------------

/** The head records their own score for one criterion, with a mandatory reason.
 *  The response says only that it was recorded — never whether it fell inside
 *  the tolerance band. */
export async function recordHodScore(
  viewer: Viewer,
  input: { entryId: number; criterion: CriterionKey; hodScore: number; justification: string },
) {
  if (!input.justification?.trim()) {
    throw new PerformanceError('A written reason is required before a score can be changed.', 400);
  }
  if (!isHead(viewer.role) && !ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new PerformanceError('Only the head of department may object to a performance score.', 403);
  }
  if (!Number.isFinite(input.hodScore) || input.hodScore < 0 || input.hodScore > 100) {
    throw new PerformanceError('The score must be between 0 and 100.', 400);
  }

  const entry = await loadEntry(viewer, input.entryId);
  if (entry.pesuser_name === viewer.name) {
    throw new PerformanceError('You cannot counter-score your own performance.', 403);
  }
  if (isHead(viewer.role) && entry.dept !== viewer.dept) {
    throw new PerformanceError('That staff member is not in your department.', 403);
  }
  if (entry.status === 'draft') {
    throw new PerformanceError('This performance record has not been submitted yet.', 409);
  }

  const row = await prisma.performance_criterion_score.findFirst({
    where: { entry_id: entry.id, criterion: input.criterion },
  });
  if (!row) throw new PerformanceError('That criterion has not been scored yet.', 404);

  const decision = reconcile({
    staffScore: Number(row.staff_score ?? 0),
    hodScore: input.hodScore,
    hodJustified: true,
  });

  // The staff member is prompted either way, so that being asked carries no
  // information about where the band sits.
  const settled = 'store' in decision && decision.store;

  await prisma.performance_criterion_score.update({
    where: { id: row.id },
    data: {
      hod_score: input.hodScore,
      hod_justification: input.justification,
      reconciliation: settled ? decision.outcome : 'awaiting_staff_response',
      recorded_score: settled ? decision.recorded : null,
    },
  });

  await refreshEntryStatus(entry.id);

  return { recorded: true };
}

/** The staff member accepts or rejects their head's score. */
export async function respondToHod(
  viewer: Viewer,
  input: { entryId: number; criterion: CriterionKey; accepted: boolean },
) {
  const entry = await loadEntry(viewer, input.entryId);
  if (viewer.name !== entry.pesuser_name) {
    throw new PerformanceError('Only the staff member can respond to their own review.', 403);
  }

  const row = await prisma.performance_criterion_score.findFirst({
    where: { entry_id: entry.id, criterion: input.criterion },
  });
  if (!row || row.hod_score === null) {
    throw new PerformanceError('There is nothing to respond to.', 404);
  }
  if (row.staff_accepted !== null && row.staff_accepted !== undefined) {
    throw new PerformanceError('You have already responded to this criterion.', 409);
  }

  const decision = reconcile({
    staffScore: Number(row.staff_score ?? 0),
    hodScore: Number(row.hod_score),
    hodJustified: true,
    staffAccepted: input.accepted,
  });
  if (!('store' in decision)) {
    throw new PerformanceError('That review is not ready for a response.', 409);
  }

  await prisma.performance_criterion_score.update({
    where: { id: row.id },
    data: {
      staff_accepted: input.accepted,
      reconciliation: decision.outcome,
      // "do not store" means the figure is held out of the results until the
      // auditor rules, not that it is discarded.
      recorded_score: decision.store ? decision.recorded : null,
    },
  });

  if (decision.flag) {
    // A flag alone does not stop the clock; only an unresolved figure does, and
    // that is decided by the rows, not here.
    await prisma.performance_entry.update({
      where: { id: entry.id },
      data: { flagged: true },
    });
  }
  await refreshEntryStatus(entry.id);

  // The staff member learns the outcome of their own choice, never the band.
  return { outcome: decision.flag && !decision.store ? 'referred' : 'settled' };
}

/** The external auditor's figure is final. */
export async function recordAuditorScore(
  viewer: Viewer,
  input: { entryId: number; criterion: CriterionKey; score: number; note?: string },
) {
  if (viewer.role !== 'auditor' && !ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new PerformanceError('Only the performance auditor can resolve a referred score.', 403);
  }
  if (!Number.isFinite(input.score) || input.score < 0 || input.score > 100) {
    throw new PerformanceError('The score must be between 0 and 100.', 400);
  }

  const entry = await loadEntry(viewer, input.entryId);
  const row = await prisma.performance_criterion_score.findFirst({
    where: { entry_id: entry.id, criterion: input.criterion },
  });
  if (!row) throw new PerformanceError('That criterion has not been scored yet.', 404);

  await prisma.performance_criterion_score.update({
    where: { id: row.id },
    data: {
      auditor_score: input.score,
      auditor_note: input.note ?? null,
      recorded_score: input.score,
      reconciliation: 'auditor_final',
    },
  });

  await refreshEntryStatus(entry.id);
  return { resolved: true };
}

/** Recompute an entry's status from its criterion rows.
 *
 *  Derived rather than stamped. Stamping it at each step lost referrals: a head
 *  who objected to a second criterion after the first had already gone to the
 *  auditor overwrote 'referred_to_auditor' with 'awaiting_staff', and the entry
 *  silently dropped out of the auditor's queue.
 *
 *  A referral outranks a pending response, because it is the state that actually
 *  holds a figure back. */
async function refreshEntryStatus(entryId: number) {
  const entry = await prisma.performance_entry.findUnique({ where: { id: entryId } });
  if (!entry || entry.status === 'draft') return;

  const rows = await prisma.performance_criterion_score.findMany({ where: { entry_id: entryId } });
  const referred = rows.some((r) => r.reconciliation === 'referred_to_auditor');
  const awaiting = rows.some((r) => r.reconciliation === 'awaiting_staff_response');

  const status = referred
    ? 'referred_to_auditor'
    : awaiting
      ? 'awaiting_staff'
      : // Nothing outstanding. Keep an already-evaluated entry evaluated rather
        // than pushing it back to submitted.
        entry.evaluated_at
        ? 'evaluated'
        : 'submitted';

  await prisma.performance_entry.update({
    where: { id: entryId },
    data: { status, updated_at: new Date() },
  });
}

/** Everything the auditor still has to rule on, across the org. */
export async function auditorQueue(viewer: Viewer) {
  if (viewer.role !== 'auditor' && !ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new PerformanceError('This queue is for the performance auditor.', 403);
  }
  // Keyed off the criterion rows rather than the entry's status, so a referral
  // cannot be hidden by whatever the entry's status happens to say.
  return prisma.performance_entry.findMany({
    where: {
      org: viewer.org,
      criteria: { some: { reconciliation: 'referred_to_auditor' } },
    },
    include: {
      criteria: {
        where: { reconciliation: 'referred_to_auditor' },
      },
    },
    orderBy: { updated_at: 'asc' },
  });
}

// ---------------------------------------------------------------------------
// Scoring the head
// ---------------------------------------------------------------------------

/** Draw the staff who will score each head, once, at period close.
 *
 *  "the software should be able to randomly select staff that will score the HOD
 *   on their performance". The draw is over the head's own department, excluding
 *   the head and any other head in it. Where a department has fewer staff than
 *   the sample size, everyone available is drawn — the minimum then decides
 *   whether the result stands. */
export async function drawHodRaters(viewer: Viewer, periodId: number) {
  requireOrgAdmin(viewer);
  const period = await loadPeriod(viewer, periodId);

  const heads = await prisma.pesuser.findMany({
    where: { org: viewer.org, role: { in: HEAD_ROLES }, dept: { not: null } },
    select: { name: true, dept: true },
  });

  let drawn = 0;
  const skipped: { hod: string; dept: string; reason: string }[] = [];

  for (const head of heads) {
    const dept = head.dept as string;

    const existing = await prisma.hod_performance_rater.count({
      where: { period_id: period.id, hod_name: head.name },
    });
    if (existing > 0) continue; // The draw happens once per period.

    const pool = await prisma.pesuser.findMany({
      where: {
        org: viewer.org,
        dept,
        name: { not: head.name },
        role: { notIn: [...HEAD_ROLES, ...ORG_ADMIN_ROLES] },
      },
      select: { name: true },
    });

    if (pool.length === 0) {
      skipped.push({ hod: head.name, dept, reason: 'No staff in the department to draw from.' });
      continue;
    }

    const sample = shuffle(pool.map((p) => p.name)).slice(0, period.rater_sample);
    await prisma.hod_performance_rater.createMany({
      data: sample.map((rater) => ({
        org: viewer.org,
        period_id: period.id,
        dept,
        hod_name: head.name,
        rater_name: rater,
      })),
      skipDuplicates: true,
    });
    drawn += sample.length;

    if (sample.length < period.rater_minimum) {
      skipped.push({
        hod: head.name,
        dept,
        reason: `Only ${sample.length} staff available; ${period.rater_minimum} returns are needed for a result.`,
      });
    }
  }

  return { heads: heads.length, raters: drawn, warnings: skipped };
}

/** Fisher-Yates. Math.random is fine here: the draw is a fairness device, not a
 *  security control, and it is run once by the admin rather than per request. */
function shuffle<T>(xs: T[]): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The heads this viewer has been drawn to score, and whether they have done it. */
export async function myHodAssignments(viewer: Viewer) {
  const rows = await prisma.hod_performance_rater.findMany({
    where: { org: viewer.org, rater_name: viewer.name },
    include: { period: { select: { id: true, status: true, starts_on: true, ends_on: true } } },
    orderBy: { created_at: 'desc' },
  });

  return rows.map((r) => ({
    id: r.id,
    periodId: r.period_id,
    periodStatus: r.period.status,
    dept: r.dept,
    hodName: r.hod_name,
    submitted: Boolean(r.submitted_at),
    submittedAt: r.submitted_at,
  }));
}

function assertHodRatings(criterion: HodCriterionKey, ratings: number[]) {
  const def = hodCriterionDef(criterion);
  if (ratings.length !== def.parameters.length) {
    throw new PerformanceError(
      `${def.label} has ${def.parameters.length} rows, but ${ratings.length} ratings were sent.`,
      400,
    );
  }
  def.parameters.forEach((p, i) => {
    const raw = Number(ratings[i]);
    if (!Number.isFinite(raw) || raw < 1 || raw > 10) {
      throw new PerformanceError(`"${p.label}" is rated from 1 to 10.`, 400);
    }
  });
}

/** A drawn staff member returns their score for the head, on both criteria.
 *  Submitted once: a rater who could revise could be leaned on to revise. */
export async function submitHodRating(
  viewer: Viewer,
  input: {
    assignmentId: number;
    management: number[];
    productivity: number[];
  },
) {
  const row = await prisma.hod_performance_rater.findFirst({
    where: { id: input.assignmentId, org: viewer.org },
  });
  if (!row) throw new PerformanceError('That assignment does not exist.', 404);
  if (row.rater_name !== viewer.name) {
    throw new PerformanceError('You were not selected to score this head.', 403);
  }
  if (row.submitted_at) {
    throw new PerformanceError('You have already scored this head.', 409);
  }

  assertHodRatings('management', input.management);
  assertHodRatings('productivity', input.productivity);

  return prisma.hod_performance_rater.update({
    where: { id: row.id },
    data: {
      management_ratings: input.management,
      productivity_ratings: input.productivity,
      management: hodCriterionResult('management', input.management),
      productivity: hodCriterionResult('productivity', input.productivity),
      submitted_at: new Date(),
    },
  });
}

/** Aggregate one head's returns into their result. */
export async function evaluateHod(viewer: Viewer, periodId: number, hodName: string) {
  requireOrgAdmin(viewer);
  const period = await loadPeriod(viewer, periodId);

  const rows = await prisma.hod_performance_rater.findMany({
    where: { period_id: period.id, hod_name: hodName, submitted_at: { not: null } },
  });

  const outcome = scoreHod(
    rows.map((r) => ({
      management: Number(r.management ?? 0),
      productivity: Number(r.productivity ?? 0),
    })),
    { minimum: period.rater_minimum, target: Number(period.target) },
  );

  const dept =
    rows[0]?.dept ??
    (await prisma.hod_performance_rater.findFirst({
      where: { period_id: period.id, hod_name: hodName },
      select: { dept: true },
    }))?.dept ??
    '';

  const data = {
    org: viewer.org,
    period_id: period.id,
    dept,
    hod_name: hodName,
    management: outcome.management,
    productivity: outcome.productivity,
    overall: outcome.overall,
    target: outcome.target,
    rtp: outcome.rtp,
    grade: outcome.grade,
    class_rank: outcome.classification?.className ?? null,
    descriptive: outcome.classification?.descriptive ?? null,
    raters: outcome.raters,
    below_minimum: outcome.belowMinimum,
    evaluated_at: new Date(),
  };

  const existing = await prisma.hod_performance_result.findFirst({
    where: { period_id: period.id, hod_name: hodName },
  });

  const result = existing
    ? await prisma.hod_performance_result.update({ where: { id: existing.id }, data })
    : await prisma.hod_performance_result.create({ data });

  return { result, outcome };
}

export async function evaluateAllHods(viewer: Viewer, periodId: number) {
  requireOrgAdmin(viewer);
  const heads = await prisma.hod_performance_rater.findMany({
    where: { org: viewer.org, period_id: periodId },
    select: { hod_name: true },
    distinct: ['hod_name'],
  });

  const out = [];
  for (const h of heads) {
    const { result } = await evaluateHod(viewer, periodId, h.hod_name);
    out.push(result);
  }
  return out;
}

/** A head's own result. Individual returns are never exposed, and the figure is
 *  withheld entirely until enough staff have responded — otherwise a head with
 *  two returns could work out who said what. */
export async function hodResults(viewer: Viewer, periodId: number) {
  const period = await loadPeriod(viewer, periodId);
  const isAdmin = ORG_ADMIN_ROLES.includes(viewer.role);

  const rows = await prisma.hod_performance_result.findMany({
    where: {
      org: viewer.org,
      period_id: periodId,
      ...(isAdmin ? {} : { hod_name: viewer.name }),
    },
  });

  if (!isAdmin && !period.released_at) {
    return rows.map((r) => ({ hod_name: r.hod_name, dept: r.dept, awaitingRelease: true }));
  }

  return rows.map((r) =>
    r.below_minimum
      ? {
          hod_name: r.hod_name,
          dept: r.dept,
          raters: r.raters,
          belowMinimum: true,
          note: 'Too few staff returned a score for this result to stand.',
        }
      : r,
  );
}

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

/** Shape an entry for the browser.
 *
 *  Withholds the grade until release, and the flag from everyone but the org
 *  admin. Neither staff nor heads ever see the tolerance band, and nothing here
 *  reveals which side of it a score fell. */
function presentEntry(
  entry: any,
  viewer: Viewer,
  released: boolean,
) {
  const isAdmin = ORG_ADMIN_ROLES.includes(viewer.role);
  const { flagged, ...rest } = entry;

  const criteria = (entry.criteria ?? []).map((c: any) => ({
    id: c.id,
    criterion: c.criterion,
    ratings: c.ratings,
    staff_score: c.staff_score,
    hod_score: c.hod_score,
    hod_justification: c.hod_justification,
    staff_accepted: c.staff_accepted,
    // The raw reconciliation name leaks the band: "accepted_by_staff" only ever
    // occurs outside it. Staff and heads see whether it is settled, not how.
    reconciliation: isAdmin ? c.reconciliation : simplifyReconciliation(c.reconciliation),
    recorded_score: released || isAdmin ? c.recorded_score : null,
    auditor_score: released || isAdmin ? c.auditor_score : null,
    auditor_note: c.auditor_note,
  }));

  // The overall is computed live rather than read from the row, so it is there
  // for the head to look at before the admin has run anything. It is the mean of
  // four figures already on this screen, so withholding it would protect
  // nothing — and the client requires the head to see these results in order to
  // object to them.
  const settled: Partial<Record<CriterionKey, number | null>> = {};
  for (const c of entry.criteria ?? []) {
    settled[c.criterion as CriterionKey] = settledScore(c);
  }
  const live = scorePerformance(settled, Number(entry.target ?? PERFORMANCE_TARGET));

  const isHeadOfThisDept = HEAD_ROLES.includes(viewer.role) && entry.dept === viewer.dept;
  const mayReview = isAdmin || isHeadOfThisDept;

  // The grade is the released artefact. Staff see it once the organization
  // releases the period; the head and the admin need it to do their job.
  const grading =
    released || mayReview
      ? {
          rtp: rest.rtp ?? live.rtp,
          grade: rest.grade ?? live.grade,
          class_rank: rest.class_rank ?? live.classification?.className ?? null,
          descriptive: rest.descriptive ?? live.classification?.descriptive ?? null,
        }
      : { rtp: null, grade: null, class_rank: null, descriptive: null };

  return {
    ...rest,
    overall: live.criteria.length === 0 ? null : round2(live.overall),
    partial: live.partial,
    ...grading,
    criteria,
    ...(isAdmin ? { flagged } : {}),
    released,
  };
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

function simplifyReconciliation(value: string | null): string | null {
  if (!value) return null;
  if (value === 'awaiting_staff_response') return 'awaiting_your_response';
  if (value === 'referred_to_auditor') return 'referred_to_auditor';
  if (value === 'auditor_final') return 'auditor_final';
  return 'settled';
}

// ---------------------------------------------------------------------------
// Notice — what this person has to do about performance right now
// ---------------------------------------------------------------------------

export type PerformanceNotice = {
  periodId: number | null;
  periodStatus: string | null;
  needsEntry: boolean;
  awaitingYourResponse: number;
  hodScoringPending: number;
  released: boolean;
};

export async function performanceNotice(viewer: Viewer): Promise<PerformanceNotice> {
  const period =
    (await currentPeriod(viewer.org)) ??
    (await prisma.performance_period.findFirst({
      where: { org: viewer.org },
      orderBy: { starts_on: 'desc' },
    }));

  if (!period) {
    return {
      periodId: null,
      periodStatus: null,
      needsEntry: false,
      awaitingYourResponse: 0,
      hodScoringPending: 0,
      released: false,
    };
  }

  const entry = await prisma.performance_entry.findFirst({
    where: { period_id: period.id, pesuser_name: viewer.name },
    include: { criteria: true },
  });

  const awaiting = (entry?.criteria ?? []).filter(
    (c) => c.reconciliation === 'awaiting_staff_response',
  ).length;

  const pending = await prisma.hod_performance_rater.count({
    where: { org: viewer.org, period_id: period.id, rater_name: viewer.name, submitted_at: null },
  });

  return {
    periodId: period.id,
    periodStatus: period.status,
    needsEntry: period.status === 'open' && (!entry || entry.status === 'draft'),
    awaitingYourResponse: awaiting,
    hodScoringPending: pending,
    released: Boolean(period.released_at),
  };
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function requireOrgAdmin(viewer: Viewer) {
  if (!ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new PerformanceError('This action is restricted to the organization admin.', 403);
  }
}

async function loadPeriod(viewer: Viewer, periodId: number) {
  const period = await prisma.performance_period.findFirst({
    where: { id: periodId, org: viewer.org },
  });
  if (!period) throw new PerformanceError('Performance period not found.', 404);
  return period;
}

async function loadEntry(viewer: Viewer, entryId: number) {
  const entry = await prisma.performance_entry.findFirst({
    where: { id: entryId, org: viewer.org },
  });
  if (!entry) throw new PerformanceError('Performance record not found.', 404);
  return entry;
}

export { CRITERION_KEYS, HOD_CRITERION_KEYS, PERFORMANCE_TARGET };
