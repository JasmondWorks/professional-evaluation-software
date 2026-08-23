// Pure performance-scoring math. No React, no database — just functions over
// numbers, so the input form, the head's reconciliation step and the results
// screens all compute the same figures, and the whole chain is unit-testable.
// This is the ONLY place the performance formulas live.
//
// The chain, per the client's instruction of 22 Aug 2026:
//
//   ratings (1-10 per work parameter)
//     -> parameter score   = rating / 10 x parameter maximum
//     -> criterion result  = SUM parameter scores / SUM maxima x 100
//     -> overall result    = mean of the four criterion results
//     -> RTP               = (overall - 55) / 55 x 100
//     -> grade             = the same five RTP bands as appraisal
//
// Five results per staff member: competence, integrity, compatibility, use of
// resources, and the overall.

import {
  CRITERIA,
  CRITERION_KEYS,
  CriterionKey,
  HOD_CRITERIA,
  HodCriterionKey,
  hodCriterionDef,
  PERFORMANCE_CLASSES,
  PERFORMANCE_TARGET,
  PerformanceClass,
  RATING_MAX,
  RATING_MIN,
  TOLERANCE_BAND,
  criterionDef,
  criterionMaximum,
} from './instrument';

/** The five RTP grades, identical to the appraisal model's so a staff member
 *  reads one vocabulary across both. */
export type Grade = 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';

export const GRADE_BANDS: {
  grade: Grade;
  minRtp: number | null;
  minInclusive: boolean;
  maxRtp: number | null;
  maxInclusive: boolean;
  condition: string;
}[] = [
  { grade: 'Excellent', minRtp: 25,  minInclusive: false, maxRtp: null, maxInclusive: false, condition: 'More than 25% above target' },
  { grade: 'Very Good', minRtp: 5,   minInclusive: false, maxRtp: 25,   maxInclusive: true,  condition: 'Above 5% and up to 25% above target' },
  { grade: 'Good',      minRtp: -5,  minInclusive: true,  maxRtp: 5,    maxInclusive: true,  condition: 'Within 5% either side of target' },
  { grade: 'Fair',      minRtp: -25, minInclusive: true,  maxRtp: -5,   maxInclusive: false, condition: 'Below 5% and down to 25% below target' },
  { grade: 'Poor',      minRtp: null, minInclusive: false, maxRtp: -25, maxInclusive: false, condition: 'More than 25% below target' },
];

// ---------------------------------------------------------------------------
// Criterion scoring
// ---------------------------------------------------------------------------

/** One parameter's point score. The rating claims that fraction of the
 *  parameter's maximum, so a 7 on a parameter worth 40 points scores 28. */
export function parameterScore(rating: number, max: number): number {
  return (clampRating(rating) / RATING_MAX) * Math.max(max, 0);
}

/** Normalise one criterion's ratings to 100.
 *
 *  `ratings` is positional, one entry per parameter in the criterion's declared
 *  order. A missing entry scores the floor of the scale rather than zero,
 *  because the scale starts at 1 — there is no "no answer" point on this form,
 *  and the caller is expected to have required every row. */
export function criterionResult(key: CriterionKey, ratings: number[]): number {
  const def = criterionDef(key);
  const total = def.parameters.reduce(
    (sum, p, i) => sum + parameterScore(ratings[i] ?? RATING_MIN, p.max),
    0,
  );
  const max = criterionMaximum(key);
  return max === 0 ? 0 : clampPercent((total / max) * 100);
}

/** Score every criterion at once from a map of ratings. */
export function allCriterionResults(
  ratings: Partial<Record<CriterionKey, number[]>>,
): Record<CriterionKey, number> {
  const out = {} as Record<CriterionKey, number>;
  for (const key of CRITERION_KEYS) {
    out[key] = criterionResult(key, ratings[key] ?? []);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Overall, RTP and grade
// ---------------------------------------------------------------------------

export type CriterionResult = {
  key: CriterionKey;
  /** The criterion's result, normalised to 100. */
  result: number;
};

export type PerformanceOutcome = {
  criteria: CriterionResult[];
  /** The mean of the four criterion results — the fifth result. */
  overall: number;
  target: number;
  rtp: number | null;
  grade: Grade | null;
  /** The document's own classification of the raw overall percentage. */
  classification: PerformanceClass | null;
  /** True when fewer than four criteria were scored, so the overall covers only
   *  part of the assessment. */
  partial: boolean;
  missing: CriterionKey[];
};

/** The overall performance result and its grading.
 *
 *  `results` may be partial: a criterion still awaiting reconciliation has no
 *  recorded figure yet. Missing criteria are left out of the mean rather than
 *  counted as zero, which would drag the overall down and grade someone on work
 *  that has not been settled. The outcome says so via `partial`. */
export function scorePerformance(
  results: Partial<Record<CriterionKey, number | null>>,
  target: number = PERFORMANCE_TARGET,
): PerformanceOutcome {
  const criteria: CriterionResult[] = [];
  const missing: CriterionKey[] = [];

  for (const key of CRITERION_KEYS) {
    const value = results[key];
    if (value === undefined || value === null || !Number.isFinite(value)) {
      missing.push(key);
      continue;
    }
    criteria.push({ key, result: clampPercent(value) });
  }

  const overall = mean(criteria.map((c) => c.result));
  const rtp = criteria.length === 0 ? null : rtpOf(overall, target);

  return {
    criteria,
    overall,
    target,
    rtp,
    grade: rtp === null ? null : gradeOf(rtp),
    classification: criteria.length === 0 ? null : classify(overall),
    partial: missing.length > 0,
    missing,
  };
}

/** Relative to Target Performance, as a percentage of target. Returns null on a
 *  zero or absent target rather than dividing by zero. */
export function rtpOf(observed: number, target: number = PERFORMANCE_TARGET): number | null {
  if (!target) return null;
  return ((observed - target) / target) * 100;
}

/** Map an RTP to one of the five grades, honouring each band's inclusivity.
 *  Good owns both +/-5 endpoints; Fair and Poor separate at -25 inclusive on the
 *  Fair side. Same layout as appraisal. */
export function gradeOf(rtp: number): Grade {
  for (const band of GRADE_BANDS) {
    const aboveMin =
      band.minRtp === null || (band.minInclusive ? rtp >= band.minRtp : rtp > band.minRtp);
    const belowMax =
      band.maxRtp === null || (band.maxInclusive ? rtp <= band.maxRtp : rtp < band.maxRtp);
    if (aboveMin && belowMax) return band.grade;
  }
  // The bands span the whole line, so this is unreachable in practice.
  return 'Poor';
}

/** The document's seven-class scheme, read off the raw percentage. */
export function classify(overallPercent: number): PerformanceClass {
  const p = clampPercent(overallPercent);
  return (
    PERFORMANCE_CLASSES.find((c) => p >= c.min && p <= c.max) ??
    PERFORMANCE_CLASSES[PERFORMANCE_CLASSES.length - 1]
  );
}

// ---------------------------------------------------------------------------
// The head's own score
// ---------------------------------------------------------------------------

/** One rater's return on one of the head's two criteria, normalised to 100.
 *  Both tables are plain 1-10 scales, so the set is scored on its row count. */
export function hodCriterionResult(key: HodCriterionKey, ratings: number[]): number {
  const def = hodCriterionDef(key);
  const total = def.parameters.reduce((sum, _p, i) => sum + clampRating(ratings[i] ?? RATING_MIN), 0);
  const max = def.parameters.length * RATING_MAX;
  return max === 0 ? 0 : clampPercent((total / max) * 100);
}

export type HodReturn = {
  management: number;
  productivity: number;
};

export type HodOutcome = {
  management: number;
  productivity: number;
  /** Mean of the two criteria, on the same 0-100 scale as staff performance. */
  overall: number;
  target: number;
  rtp: number | null;
  grade: Grade | null;
  classification: PerformanceClass | null;
  raters: number;
  /** True when too few of the selected staff returned a score for the result to
   *  stand. Callers should withhold the grade rather than publish it. */
  belowMinimum: boolean;
};

/** Aggregate the returns of the randomly selected staff into the head's result.
 *  Each rater's two criterion results are averaged across raters independently,
 *  then the two are meaned, so a rater who returned one criterion cannot swing
 *  the other. */
export function scoreHod(
  returns: HodReturn[],
  opts: { minimum: number; target?: number },
): HodOutcome {
  const target = opts.target ?? PERFORMANCE_TARGET;
  const management = mean(returns.map((r) => clampPercent(r.management)));
  const productivity = mean(returns.map((r) => clampPercent(r.productivity)));
  const overall = returns.length === 0 ? 0 : mean([management, productivity]);
  const belowMinimum = returns.length < opts.minimum;
  const rtp = returns.length === 0 ? null : rtpOf(overall, target);

  return {
    management,
    productivity,
    overall,
    target,
    rtp,
    grade: rtp === null || belowMinimum ? null : gradeOf(rtp),
    classification: rtp === null || belowMinimum ? null : classify(overall),
    raters: returns.length,
    belowMinimum,
  };
}

// ---------------------------------------------------------------------------
// Reconciling the staff member's score with their head's
// ---------------------------------------------------------------------------

export type ReconciliationDecision =
  /** Inside the tolerance band: average the two and record it. */
  | { outcome: 'accepted'; recorded: number; store: true; flag: false }
  /** Outside the band and the staff member accepted the head's score. The
   *  average is recorded, and a flag is raised so the auditor can look at a
   *  large gap even when both sides agreed on it. */
  | { outcome: 'accepted_by_staff'; recorded: number; store: true; flag: boolean }
  /** Rejected, or accepted from far below the band: the score is held out of the
   *  results and passed to the external auditor, whose figure is final. */
  | { outcome: 'referred_to_auditor'; recorded: number; store: false; flag: true };

export type ReconciliationInput = {
  staffScore: number;
  hodScore: number;
  /** Whether the head supplied the written reason the model requires. */
  hodJustified: boolean;
  /** Set once the staff member has responded to the head's objection. */
  staffAccepted?: boolean;
};

/** Decide what happens to a pair of scores.
 *
 *  IMPORTANT: the staff member is asked whenever their head records a different
 *  score, in band or out. Prompting only on large gaps would make the prompt
 *  itself announce "your score is more than N% from your head's", and the band
 *  would be deduced within two cycles. The band must stay unknown, so the prompt
 *  carries no information.
 *
 *  The band therefore decides only what an ACCEPTANCE records. A rejection
 *  always goes to the auditor. This mirrors the appraisal model exactly, which
 *  is what the client asked for: "the HOD must be able to view these results and
 *  either object by providing his own score with reason which is subject to the
 *  staff acceptance or rejection once this is flagged if becomes an external
 *  auditors final decision." */
export function reconcile(
  input: ReconciliationInput,
): ReconciliationDecision | { outcome: 'awaiting_staff_response' } {
  const average = (input.staffScore + input.hodScore) / 2;

  // Distance from the head's score, as a percentage of it.
  const deviation =
    input.hodScore === 0 ? 0 : ((input.staffScore - input.hodScore) / input.hodScore) * 100;
  const inBand = Math.abs(deviation) <= TOLERANCE_BAND;

  // The head must justify a changed score before the staff member is asked.
  if (!input.hodJustified) return { outcome: 'awaiting_staff_response' };
  if (input.staffAccepted === undefined) return { outcome: 'awaiting_staff_response' };

  if (!input.staffAccepted) {
    return { outcome: 'referred_to_auditor', recorded: input.hodScore, store: false, flag: true };
  }

  if (inBand) {
    return { outcome: 'accepted', recorded: average, store: true, flag: false };
  }
  // Outside the band: below it the head's figure stands and the auditor rules;
  // above it the average is recorded and flagged.
  return deviation < 0
    ? { outcome: 'referred_to_auditor', recorded: input.hodScore, store: false, flag: true }
    : { outcome: 'accepted_by_staff', recorded: average, store: true, flag: true };
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}

function mean(xs: number[]): number {
  return xs.length === 0 ? 0 : sum(xs) / xs.length;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(Math.max(x, lo), hi);
}

function clampPercent(x: number): number {
  return clamp(Number.isFinite(x) ? x : 0, 0, 100);
}

function clampRating(x: number): number {
  return clamp(Number.isFinite(x) ? x : RATING_MIN, RATING_MIN, RATING_MAX);
}

export { CRITERIA, CRITERION_KEYS, HOD_CRITERIA, PERFORMANCE_TARGET };
