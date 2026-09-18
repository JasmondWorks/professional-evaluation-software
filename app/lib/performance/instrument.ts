// The performance model's fixed data: the work parameters, how they group into
// the four achievement criteria, the two criteria the HOD is scored on, and the
// grading scheme. Pure data and pure predicates — no React, no database — so the
// forms, the API and the results screens all read the same definitions.
//
// Source: the client's instruction of 22 Aug 2026, read against the full
// document pages 100-103.
//
//   "there are basically four performance criteria needed for data collection
//    and these are competence, integrity, compatibility and use of resources
//    ... normalise to 100 for each criteria scoring and then the overall
//    performance score will be the mean of the four criteria."
//
// So five results per staff member: one per criterion plus the overall.

export type CriterionKey = 'competence' | 'integrity' | 'compatibility' | 'use_of_resources';

export const CRITERION_KEYS: CriterionKey[] = [
  'competence',
  'integrity',
  'compatibility',
  'use_of_resources',
];

export const CRITERION_LABELS: Record<CriterionKey, string> = {
  competence: 'Competence',
  integrity: 'Integrity',
  compatibility: 'Compatibility',
  use_of_resources: 'Use of Resources',
};

export type WorkParameter = {
  key: string;
  label: string;
  /** Maximum point score for this parameter, from the parameter-grade matrix on
   *  pages 100-101 of the full document. */
  max: number;
};

export type CriterionDef = {
  key: CriterionKey;
  label: string;
  parameters: WorkParameter[];
};

// ---------------------------------------------------------------------------
// The 22 work parameters
// ---------------------------------------------------------------------------
//
// The maxima are the top of each parameter's "Very Outstanding" band in the
// document's matrix. NOTE: the previous implementation had Hardwork at 55,
// Quality of work at 10 and Reporting at 20. The document gives 100, 100 and 30.
// Those three were wrong, which made every competence result wrong; the
// document's figures are used here. Integrity, Compatibility and Use of
// Resources already agreed with the document and are unchanged.

export const CRITERIA: CriterionDef[] = [
  {
    key: 'competence',
    label: 'Competence',
    parameters: [
      { key: 'hardwork', label: 'Hardwork (quantity)', max: 100 },
      { key: 'quality_of_work', label: 'Quality of work', max: 100 },
      { key: 'initiative', label: 'Initiative', max: 60 },
      { key: 'creativity', label: 'Creativity', max: 60 },
      { key: 'expertise', label: 'Expertise', max: 30 },
      { key: 'supervision', label: 'Supervision', max: 40 },
      { key: 'reporting', label: 'Reporting', max: 30 },
      { key: 'work_planning', label: 'Work planning', max: 30 },
    ],
  },
  {
    key: 'integrity',
    label: 'Integrity',
    parameters: [
      { key: 'leadership', label: 'Leadership', max: 100 },
      { key: 'dedication', label: 'Dedication', max: 70 },
      { key: 'honesty', label: 'Honesty', max: 60 },
      { key: 'self_discipline', label: 'Self-discipline', max: 40 },
      { key: 'responsibility', label: 'Responsibility', max: 40 },
      { key: 'reliability', label: 'Reliability', max: 40 },
      { key: 'punctuality', label: 'Punctuality', max: 30 },
      { key: 'regularity', label: 'Regularity (absenteeism)', max: 30 },
    ],
  },
  {
    key: 'compatibility',
    label: 'Compatibility',
    parameters: [
      { key: 'team_work', label: 'Team work', max: 80 },
      { key: 'community_contribution', label: 'Contribution to the immediate community', max: 20 },
      { key: 'hospitality', label: 'Hospitality', max: 20 },
      { key: 'special_contribution', label: 'Special contribution to section/branch', max: 20 },
      { key: 'relation_to_customer', label: 'Relation to customer', max: 10 },
    ],
  },
  {
    key: 'use_of_resources',
    label: 'Use of Resources',
    parameters: [{ key: 'use_of_resources', label: 'Use of resources', max: 400 }],
  },
];

export function criterionDef(key: CriterionKey): CriterionDef {
  const def = CRITERIA.find((c) => c.key === key);
  if (!def) throw new Error(`Unknown performance criterion: ${key}`);
  return def;
}

/** The point total a criterion is normalised against: competence 450,
 *  integrity 410, compatibility 150, use of resources 400. */
export function criterionMaximum(key: CriterionKey): number {
  return criterionDef(key).parameters.reduce((sum, p) => sum + p.max, 0);
}

/** The response scale on the input form. Every parameter is rated on the same
 *  1-10 "less likely -> most likely" summative scale (document page 102), and
 *  the rating claims that fraction of the parameter's point maximum. */
export const RATING_MIN = 1;
export const RATING_MAX = 10;

// ---------------------------------------------------------------------------
// The HOD's two criteria (full document, pages 102-103)
// ---------------------------------------------------------------------------
//
// "the software should be able to randomly select staff that will score the HOD
//  on their performance subject to HOD performance criteria which is just two as
//  provided in the full and complete document pages 102-103."
//
// Those two tables are ACHIEVEMENT CRITERIA PERFORMANCE MEASUREMENT FOR
// MANAGEMENT and ... FOR PRODUCTIVITY. Both are plain 1-10 summative scales with
// no per-row point maxima, so each row is worth 10 and the set normalises to 100
// on its row count.

export type HodCriterionKey = 'management' | 'productivity';

export const HOD_CRITERION_KEYS: HodCriterionKey[] = ['management', 'productivity'];

export const HOD_CRITERIA: { key: HodCriterionKey; label: string; parameters: WorkParameter[] }[] = [
  {
    key: 'management',
    label: 'Management',
    parameters: [
      { key: 'hardwork', label: 'Hardwork', max: RATING_MAX },
      { key: 'initiative', label: 'Initiative', max: RATING_MAX },
      { key: 'reporting', label: 'Reporting', max: RATING_MAX },
      { key: 'planning', label: 'Planning', max: RATING_MAX },
      { key: 'supervision', label: 'Supervision', max: RATING_MAX },
      { key: 'teamwork', label: 'Teamwork', max: RATING_MAX },
      { key: 'leadership', label: 'Leadership', max: RATING_MAX },
      { key: 'use_of_resources', label: 'Use of resources', max: RATING_MAX },
    ],
  },
  {
    key: 'productivity',
    label: 'Productivity',
    parameters: [
      { key: 'hardwork', label: 'Hardwork', max: RATING_MAX },
      { key: 'quality', label: 'Quality', max: RATING_MAX },
      { key: 'initiative', label: 'Initiative', max: RATING_MAX },
      { key: 'creativity', label: 'Creativity', max: RATING_MAX },
      { key: 'use_of_resources', label: 'Use of resources', max: RATING_MAX },
    ],
  },
];

export function hodCriterionDef(key: HodCriterionKey) {
  const def = HOD_CRITERIA.find((c) => c.key === key);
  if (!def) throw new Error(`Unknown HOD performance criterion: ${key}`);
  return def;
}

/** How many of a head's own staff are drawn to score them, and the fewest whose
 *  returns will still produce a result. Both are defaults an organization can
 *  override per period. Below the minimum the head is left unscored rather than
 *  graded on one or two opinions. */
export const HOD_RATER_SAMPLE = 5;
export const HOD_RATER_MINIMUM = 3;

// ---------------------------------------------------------------------------
// Grading
// ---------------------------------------------------------------------------

/** "There must be an RTP grading of the overall performance results for staff
 *  just as we do for appraisal but here the target is 55." Overall performance
 *  is a percentage, so the target is 55%. */
export const PERFORMANCE_TARGET = 55;

/** How far the staff member's own score may sit from their head's before a
 *  disagreement is escalated. BACKGROUND ONLY — as in appraisal, neither staff
 *  nor heads may see this, and the flag surfaces only to the organization admin.
 *  Matched to the appraisal band the client restated on 10 Aug 2026. */
export const TOLERANCE_BAND = 10;

/** The document's own Performance Classification Scheme (page 101), read off the
 *  raw overall percentage. Kept alongside the RTP grade because the motivation
 *  model's winning criteria on page 105 are written in this vocabulary —
 *  "Very Outstanding" / "Excellent" / "Very Good" three-year performance. */
export type PerformanceClass = {
  min: number;
  max: number;
  className: string;
  descriptive: string;
};

export const PERFORMANCE_CLASSES: PerformanceClass[] = [
  { min: 91, max: 100, className: '1st Class', descriptive: 'Very Outstanding' },
  { min: 81, max: 90.999999, className: '2nd Class', descriptive: 'Excellent' },
  { min: 66, max: 80.999999, className: '3rd Class', descriptive: 'Very Good' },
  { min: 50, max: 65.999999, className: '4th Class', descriptive: 'Good' },
  { min: 41, max: 49.999999, className: '5th Class', descriptive: 'Fair' },
  { min: 21, max: 40.999999, className: '6th Class', descriptive: 'Poor' },
  { min: 0, max: 20.999999, className: '7th Class', descriptive: 'Very Poor' },
];

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const ORG_ADMIN_ROLES = ['super-admin', 'admin'];

/** Heads who counter-score their department's performance results, and who are
 *  themselves scored by a random sample of their staff. */
export const HEAD_ROLES = ['hod', 'unit-head'];

/** Roles whose view is their whole department rather than just themselves. */
export const DEPARTMENT_SCOPED_ROLES = [...HEAD_ROLES, 'dept-admin'];

export function isHead(role: string): boolean {
  return HEAD_ROLES.includes(role);
}

/** Where a performance entry has got to, for the stage banner. */
export type PerformanceStage =
  | 'draft'
  | 'submitted'
  | 'awaiting_staff'
  | 'referred_to_auditor'
  | 'evaluated';
