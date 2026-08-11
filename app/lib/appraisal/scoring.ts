// Pure appraisal-scoring math. No React, no DB — just functions over numbers, so
// it can be reused by the forms, the HOD reconciliation step and the results
// screens, and unit-tested in isolation. This is the ONLY place the formulas
// live.
//
// The chain, per the client's clarification of 4 Aug 2026:
//
//   BOTH MODELS   quality %  ->  worth          (per form)
//                 quantity   ->  from the quantification scheme
//                 observed   =   quantity x worth, summed within a category
//                 RTP        =   (SUM observed - SUM target) / SUM target x 100
//
// Academic has four categories, with Forms 8 and 9 both feeding Teaching.
// Non-academic has three, one form each, measured against one total target for
// the staff member's grade. Which model applies is decided by product and staff
// type: see modelFor() in ./instrument.

import {
  ALL_FORMS,
  ACADEMIC_TARGETS,
  FormKey,
  ADMINISTRATIVE_POST_TARGETS,
  AppraisalModel,
  CategoryKey,
  GRADE_BANDS,
  Grade,
  MIN_STUDENT_EVALUATIONS,
  NON_ACADEMIC_TARGETS,
  PositionKey,
  QUANTIFICATION_SCHEME,
  STUDENT_QUANTITY_PER_STUDENT,
  TOLERANCE_BAND,
  WORTH_BANDS,
} from './instrument';

// ---------------------------------------------------------------------------
// Quality
// ---------------------------------------------------------------------------

/** Turn a form's line-item scores into a quality percentage. Forms 8, 9 and 10
 *  each total 100, so this is a sum guarded against an over-length input. */
export function formQuality(formKey: FormKey, scores: number[]): number {
  const form = ALL_FORMS.find((f) => f.key === formKey);
  if (!form) throw new Error(`Unknown appraisal form: ${formKey}`);

  // Forms 11 and 12 record a quality score directly against the indicator.
  if (form.directScore) return clampPercent(scores[0] ?? 0);

  const total = form.items.reduce((sum, item, i) => {
    const raw = Number(scores[i] ?? 0);
    // A line item can never exceed its stated maximum.
    return sum + Math.min(Math.max(raw, 0), item.max);
  }, 0);

  const max = form.items.reduce((sum, item) => sum + item.max, 0);
  return max === 0 ? 0 : clampPercent((total / max) * 100);
}

/** The recorded student evaluation result is the mean of the submitted copies.
 *  Returns null when there are too few to compute on, so callers can block
 *  rather than score a short sample. */
export function studentEvaluationQuality(
  copies: number[][],
  studentCount: number,
): { quality: number | null; sufficient: boolean; required: number } {
  // The minimum only binds when the course has more students than the minimum.
  const required = studentCount > MIN_STUDENT_EVALUATIONS ? MIN_STUDENT_EVALUATIONS : studentCount;
  const sufficient = copies.length >= required && copies.length > 0;
  if (!sufficient) return { quality: null, sufficient: false, required };

  const perCopy = copies.map((c) => formQuality('student_evaluation', c));
  return { quality: mean(perCopy), sufficient: true, required };
}

// ---------------------------------------------------------------------------
// Worth  (background only — never return this to the browser)
// ---------------------------------------------------------------------------

/** Read the worth of a quality percentage from the banded scheme. Stepped, not
 *  interpolated: 64% and 66% both give 12. */
export function worthOf(qualityPercent: number): number {
  const q = clampPercent(qualityPercent);
  const band = WORTH_BANDS.find((b) => q >= b.min && q <= b.max);
  // Bands are contiguous across 0..100, so this only trips on a rounding edge.
  return band ? band.worth : 0;
}

// ---------------------------------------------------------------------------
// Quantity
// ---------------------------------------------------------------------------

export type QuantityInput = {
  ruleKey: string;
  /** Pages, semester hours, or certified works, depending on the rule. */
  measure: number;
  /** Assessed scripts, for the two teaching rules. */
  scripts?: number;
};

/** Convert one piece of evidence into output units via the quantification
 *  scheme. Patents and prototypes are entered as a unit count in 1..4 rather
 *  than a multiplier, so the measure is clamped to the rule's range. */
export function quantityOf(input: QuantityInput): number {
  const rule = QUANTIFICATION_SCHEME.find((r) => r.key === input.ruleKey);
  if (!rule) throw new Error(`Unknown quantification rule: ${input.ruleKey}`);

  if (rule.range) {
    return clamp(input.measure, rule.range.min, rule.range.max);
  }

  const base = rule.unitsPer * Math.max(input.measure, 0);
  const scripts = rule.perScript ? rule.perScript * Math.max(input.scripts ?? 0, 0) : 0;
  return base + scripts;
}

/** Total quantity for a category, summing every piece of evidence recorded. */
export function categoryQuantity(inputs: QuantityInput[]): number {
  return inputs.reduce((sum, i) => sum + quantityOf(i), 0);
}

/** Student evaluation quantity has its own rule: the basic units of the course
 *  being appraised, plus 0.02 per student. */
export function studentQuantity(basicUnits: number, studentCount: number): number {
  return Math.max(basicUnits, 0) + STUDENT_QUANTITY_PER_STUDENT * Math.max(studentCount, 0);
}

// ---------------------------------------------------------------------------
// Observed output and RTP
// ---------------------------------------------------------------------------

export type CategoryResult = {
  key: CategoryKey;
  /** Sum of the observed outputs of every form feeding this category. */
  observed: number;
  target: number | null;
};

/** One category's observed output: quantity multiplied by the worth of its
 *  quality. */
export function categoryObserved(quantity: number, qualityPercent: number): number {
  return quantity * worthOf(qualityPercent);
}

export type FormResult = {
  form: FormKey;
  quality: number;
  quantity: number;
};

export type AppraisalOutcome = {
  categories: CategoryResult[];
  totalObserved: number;
  totalTarget: number;
  rtp: number | null;
  grade: Grade | null;
  /** True when a scored category has no target configured, so the combined
   *  figure covers only part of the appraisal. */
  partialTarget: boolean;
  missingTargets: CategoryKey[];
};

export type AcademicInput = {
  position: PositionKey;
  administrativePost?: string;
  forms: FormResult[];
  /** Configured targets per category, overriding the documented defaults. This
   *  is how an institution's own figures take effect. Omit a key to fall back. */
  targetOverrides?: Partial<Record<CategoryKey, number | null>>;
};

/** Group form results into their categories and sum the observed output within
 *  each. Teaching receives both Form 8 and Form 9, which is what the client
 *  meant by adding the student evaluation result to the teaching quality result:
 *  each form keeps its own quantity and its own worth, and their outputs add.
 *  (Adding the raw percentages instead would exceed 100 and break the worth
 *  lookup, so this is the only reading the arithmetic allows.) */
export function groupIntoCategories(forms: FormResult[]): Map<CategoryKey, number> {
  const observedByCategory = new Map<CategoryKey, number>();
  for (const f of forms) {
    const def = ALL_FORMS.find((d) => d.key === f.form);
    if (!def) throw new Error(`Unknown appraisal form: ${f.form}`);
    const prior = observedByCategory.get(def.category) ?? 0;
    observedByCategory.set(def.category, prior + categoryObserved(f.quantity, f.quality));
  }
  return observedByCategory;
}

/** Academic appraisal. Four categories, each producing an observed output. The
 *  four observed outputs and the four targets are summed, and one RTP is taken
 *  from the two totals. */
export function scoreAcademic(input: AcademicInput): AppraisalOutcome {
  const defaults = ACADEMIC_TARGETS[input.position];
  if (!defaults) throw new Error(`Unknown position: ${input.position}`);

  const adminTarget = input.administrativePost
    ? ADMINISTRATIVE_POST_TARGETS.find((p) => p.key === input.administrativePost)?.target ?? null
    : null;

  const observedByCategory = groupIntoCategories(input.forms);

  const categories: CategoryResult[] = [...observedByCategory.entries()].map(([key, observed]) => {
    const override = input.targetOverrides?.[key];
    const fallback =
      key === 'administration'
        ? adminTarget
        : (defaults as Record<string, number | null>)[key] ?? null;
    const target = override !== undefined ? override : fallback;
    return { key, observed, target };
  });

  // A category with no configured target is left out of the combined target
  // rather than counted as zero, which would inflate RTP without limit.
  const scored = categories.filter((c) => c.target !== null);
  const missingTargets = categories.filter((c) => c.target === null).map((c) => c.key);

  const totalObserved = sum(scored.map((c) => c.observed));
  const totalTarget = sum(scored.map((c) => c.target as number));
  const rtp = rtpOf(totalObserved, totalTarget);

  return {
    categories,
    totalObserved,
    totalTarget,
    rtp,
    grade: rtp === null ? null : gradeOf(rtp),
    partialTarget: missingTargets.length > 0,
    missingTargets,
  };
}

export type NonAcademicInput = {
  /** The staff member's grade, e.g. "grade_11". */
  grade: string;
  forms: FormResult[];
  /** One total target for the grade, covering all three categories. */
  target?: number | null;
};

/** Non-academic appraisal. The client withdrew the earlier "mean of the three
 *  forms times its worth" method on 10 Aug 2026 in favour of the academic
 *  method. Three categories, each quantity x worth, summed and compared against
 *  the single target for the staff member's grade. The target is no longer
 *  doubled: the supplied grade targets are already total annual figures on the
 *  same scale as the academic totals. */
export function scoreNonAcademic(input: NonAcademicInput): AppraisalOutcome {
  const observedByCategory = groupIntoCategories(input.forms);
  const totalObserved = sum([...observedByCategory.values()]);

  const target = input.target !== undefined ? input.target : NON_ACADEMIC_TARGETS[input.grade] ?? null;
  const rtp = target === null ? null : rtpOf(totalObserved, target);

  return {
    categories: [...observedByCategory.entries()].map(([key, observed]) => ({
      key, observed, target: null,
    })),
    totalObserved,
    totalTarget: target ?? 0,
    rtp,
    grade: rtp === null ? null : gradeOf(rtp),
    partialTarget: target === null,
    missingTargets: [],
  };
}

/** Relative to Target Performance, as a percentage of target. Returns null on a
 *  zero or absent target rather than dividing by zero. */
export function rtpOf(observed: number, target: number): number | null {
  if (!target) return null;
  return ((observed - target) / target) * 100;
}

/** Map an RTP to one of the five grades, honouring each band's inclusivity.
 *  Good owns both ±5 endpoints; Fair and Poor are separated at −25 inclusive on
 *  the Fair side. See GRADE_BANDS for the client-confirmed layout. */
export function gradeOf(rtp: number): Grade {
  for (const band of GRADE_BANDS) {
    const aboveMin =
      band.minRtp === null || (band.minInclusive ? rtp >= band.minRtp : rtp > band.minRtp);
    const belowMax =
      band.maxRtp === null || (band.maxInclusive ? rtp <= band.maxRtp : rtp < band.maxRtp);
    if (aboveMin && belowMax) return band.grade;
  }
  // GRADE_BANDS spans the whole line, so this is unreachable in practice.
  return 'Poor';
}

// ---------------------------------------------------------------------------
// Reconciling the appraisee's score with the HOD's
// ---------------------------------------------------------------------------

export type ReconciliationDecision =
  /** Inside the tolerance band: average the two and record it. */
  | { outcome: 'accepted'; recorded: number; store: true; flag: false }
  /** Outside the band and the appraisee accepted the HOD's score: average and
   *  record, exactly as an in-band case. */
  | { outcome: 'accepted_by_staff'; recorded: number; store: true; flag: false }
  /** Outside the band and the appraisee rejected it: hold the score out of the
   *  database and pass it to the external auditor, whose figure is final. */
  | { outcome: 'referred_to_auditor'; recorded: number; store: false; flag: true };

export type ReconciliationInput = {
  model: AppraisalModel;
  appraisalScore: number;
  hodScore: number;
  /** Whether the HOD supplied the written justification the model requires. */
  hodJustified: boolean;
  /** Set once the appraisee has responded to an out-of-band HOD score. */
  staffAccepted?: boolean;
};

/** Decide what happens to a pair of scores.
 *
 *  The tolerance band is background-only: it decides whether the appraisee is
 *  ever asked, but it is never shown to staff or HODs, and a referral surfaces
 *  only to the organization admin. Keep this on the server. */
export function reconcile(input: ReconciliationInput): ReconciliationDecision | { outcome: 'awaiting_staff_response' } {
  const band = TOLERANCE_BAND[input.model];
  const average = (input.appraisalScore + input.hodScore) / 2;

  // Distance from the HOD score, as a percentage of it.
  const deviation = input.hodScore === 0
    ? 0
    : ((input.appraisalScore - input.hodScore) / input.hodScore) * 100;

  if (Math.abs(deviation) <= band) {
    return { outcome: 'accepted', recorded: average, store: true, flag: false };
  }

  // Out of band. The model requires the HOD to justify the score they gave
  // before the appraisee is asked to accept or reject it.
  if (!input.hodJustified) return { outcome: 'awaiting_staff_response' };
  if (input.staffAccepted === undefined) return { outcome: 'awaiting_staff_response' };

  return input.staffAccepted
    ? { outcome: 'accepted_by_staff', recorded: average, store: true, flag: false }
    : { outcome: 'referred_to_auditor', recorded: input.hodScore, store: false, flag: true };
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
