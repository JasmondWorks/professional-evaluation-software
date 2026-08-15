// The appraisal instrument — the single source of truth for the five achievement
// categories, their forms and line items, the worth assessment scheme, the output
// quantification scheme, and the annual targets. Data entry, scoring and the
// results screens all derive from this, so the numbers can never drift between
// screens. Adjust a maximum or a target here and everything follows.
//
// Client answers of 10 Aug 2026 settled the model:
//   1. FOUR categories. Forms 8 and 9 both feed Teaching and share its target.
//   2. The worth table is background-only. It must never reach the browser for
//      any user, including the organization admin. Keep it server-side.
//   3. Non-academic uses the SAME method as academic (the earlier "mean of three
//      forms x worth" approach was withdrawn), over three categories, against a
//      single target for the staff member's grade.

/** The four achievement categories an appraisal is scored across. Revised by the
 *  client on 10 Aug 2026: Form 8 and Form 9 are no longer separate categories,
 *  they both feed Teaching and share the Teaching target. */
export type CategoryKey =
  // Academic: four categories. Teaching carries two forms.
  | 'teaching'
  | 'research'
  | 'administration'
  | 'community'
  // Non-academic: three categories, one form each.
  | 'activity'
  | 'training'
  | 'fault_solving';

export type FormKey =
  | 'student_evaluation'
  | 'teaching_quality'
  | 'research'
  | 'administration'
  | 'community'
  | 'activity'
  | 'training_quality'
  | 'fault_solving';

export type AppraisalModel = 'academic' | 'non_academic';

export const CATEGORY_KEYS: Record<AppraisalModel, CategoryKey[]> = {
  academic: ['teaching', 'research', 'administration', 'community'],
  non_academic: ['activity', 'training', 'fault_solving'],
};

/** Which appraisal model applies. Confirmed by the client on 10 Aug 2026:
 *  the platform has three products, and only academic staff inside the academic
 *  product use the academic model. Non-academic staff in an academic
 *  institution, and everyone in a company or public-sector organization, use the
 *  non-academic model. */
export function modelFor(
  productCategory: 'academic' | 'company' | 'public' | string,
  staffType: 'academic' | 'non_academic',
): AppraisalModel {
  return productCategory === 'academic' && staffType === 'academic'
    ? 'academic'
    : 'non_academic';
}

export type FormItem = { label: string; max: number; assessor?: string };

export type CategoryForm = {
  key: FormKey;
  /** Which achievement category this form's output is added into. */
  category: CategoryKey;
  form: number;
  label: string;
  /** Who enters the scores. Confirmed: the departmental admin enters the student
   *  evaluation AND the external/peer examiner scores — there is no separate
   *  examiner login. Everything else is entered by the appraisee. */
  enteredBy: 'department_admin' | 'appraisee';
  /** Forms 11 and 12 carry no line items; a quality score is recorded directly
   *  against each indicator, so `items` is empty and `directScore` is true. */
  directScore: boolean;
  items: FormItem[];
};

// ---------------------------------------------------------------------------
// The five forms
// ---------------------------------------------------------------------------

export const ACADEMIC_FORMS: CategoryForm[] = [
  {
    key: 'student_evaluation',
    category: 'teaching',
    form: 8,
    label: 'Student evaluation of teaching quality',
    enteredBy: 'department_admin',
    directScore: false,
    items: [
      { label: 'Attendance', max: 8 },
      { label: 'Punctuality', max: 8 },
      { label: 'Clarity of presentation', max: 20 },
      { label: 'Implementation of lecture plan', max: 15 },
      { label: 'Implementation of continuous assessment plan', max: 15 },
      { label: 'Quality, currency and depth of lectures', max: 20 },
      { label: 'Relevance and adequacy of text and reference books', max: 5 },
      { label: 'Maintenance of classroom order', max: 5 },
      { label: "Response to students' questions", max: 4 },
    ],
  },
  {
    key: 'teaching_quality',
    category: 'teaching',
    form: 9,
    label: 'Teaching quality evaluation',
    enteredBy: 'department_admin',
    directScore: false,
    items: [
      { label: 'Lecture plan', max: 8, assessor: 'External or peer' },
      { label: 'Continuous assessment plan', max: 8, assessor: 'External or peer' },
      { label: 'CAP implementation', max: 10, assessor: 'External or peer' },
      { label: 'Subject breadth coverage of examination questions', max: 8, assessor: 'External or peer' },
      { label: 'Subject depth coverage of examination questions', max: 8, assessor: 'External or peer' },
      { label: 'Examination grading scheme', max: 5, assessor: 'External or peer' },
      { label: 'Fairness in application of EGS', max: 10, assessor: 'External or peer' },
      { label: 'Recommended text and reference, relevance and adequacy', max: 3, assessor: 'External or peer' },
      { label: 'Student evaluation of lecture plan, CAP, schedule, notes and subject understanding', max: 40, assessor: 'Class students' },
    ],
  },
  {
    key: 'research',
    category: 'research',
    form: 10,
    label: 'Research quality evaluation',
    enteredBy: 'appraisee',
    directScore: false,
    items: [
      { label: 'Problem definition or scheme', max: 5 },
      { label: 'Understanding of previous work, use of literature', max: 10 },
      { label: 'Validity of background principles and concepts', max: 12 },
      { label: 'Interpretation of resulting information or model', max: 8 },
      { label: 'Validity of data gathering, analysis or analytical approach', max: 20 },
      { label: 'Attainment of objectives or contribution to knowledge', max: 25 },
      { label: 'Clarity of report including use of tables, charts, figures', max: 8 },
      { label: 'Application of findings', max: 7 },
      { label: 'References, relevance and adequacy', max: 5 },
    ],
  },
  {
    key: 'administration',
    category: 'administration',
    form: 11,
    label: 'Administration quality',
    enteredBy: 'appraisee',
    directScore: true,
    items: [],
  },
  {
    key: 'community',
    category: 'community',
    form: 12,
    label: 'Community service quality',
    enteredBy: 'appraisee',
    directScore: true,
    items: [],
  },
];

/** The non-academic model: three forms, three categories, one form each. It
 *  follows the academic method (each form yields quantity x worth, summed), but
 *  measured against a single total target for the staff member's grade.
 *
 *  Numbered 1 to 3 rather than 8 to 10. The client asked for this on 13 Aug: the
 *  8, 9, 10 numbering belongs to the academic scheme and meant nothing here.
 *
 *  All three are filled by the individual member of staff, unlike the academic
 *  Forms 8 and 9 which the departmental administrator records from paper. */
export const NON_ACADEMIC_FORMS: CategoryForm[] = [
  {
    key: 'activity',
    category: 'activity',
    form: 1,
    label: 'Activity form',
    enteredBy: 'appraisee',
    directScore: false,
    items: [
      { label: 'Attendance', max: 8 },
      { label: 'Punctuality', max: 8 },
      { label: 'Clarity of presentation', max: 20 },
      { label: 'Implementation of activity plan', max: 15 },
      { label: 'Implementation of continuous assessment plan', max: 15 },
      { label: 'Quality, currency and depth of activities done', max: 20 },
      { label: 'Relevance and adequacy of text and other aid items on the job', max: 5 },
      { label: 'Maintenance of office order', max: 5 },
      { label: "Response to staff questions from supervisors", max: 4 },
    ],
  },
  {
    key: 'training_quality',
    category: 'training',
    form: 2,
    label: 'Training quality evaluation',
    enteredBy: 'appraisee',
    directScore: false,
    items: [
      { label: 'Activities plan', max: 8, assessor: 'External or peer' },
      { label: 'Continuous assessment plan', max: 8, assessor: 'External or peer' },
      { label: 'CAP implementation', max: 10, assessor: 'External or peer' },
      { label: 'Training coverage and examination questions on trainings', max: 8, assessor: 'External or peer' },
      { label: 'Subject depth coverage of examination questions during training', max: 8, assessor: 'External or peer' },
      { label: 'Examination grading scheme from training', max: 5, assessor: 'External or peer' },
      { label: 'Fairness in application of EGS', max: 10, assessor: 'External or peer' },
      { label: 'Recommended text and training materials, relevance and adequacy', max: 3, assessor: 'External or peer' },
      { label: 'Co-staff evaluation of training plan, CAP, meeting schedule, notes and subject understanding', max: 40, assessor: 'Co-staff' },
    ],
  },
  {
    key: 'fault_solving',
    category: 'fault_solving',
    form: 3,
    label: 'Fault solving quality attribute',
    enteredBy: 'appraisee',
    directScore: false,
    items: [
      { label: 'Problem definition or scheme', max: 5 },
      { label: 'Understanding of previous work, use of literature', max: 10 },
      { label: 'Validity of background principles and concepts', max: 12 },
      { label: 'Interpretation of resulting information or model', max: 8 },
      { label: 'Validity of data gathering, analysis or analytical approach', max: 20 },
      { label: 'Attainment of objectives or contribution to knowledge', max: 25 },
      { label: 'Clarity of report including use of tables, charts, figures', max: 8 },
      { label: 'Application of findings', max: 7 },
      { label: 'References, relevance and adequacy', max: 5 },
    ],
  },
];

export const FORMS_BY_MODEL: Record<AppraisalModel, CategoryForm[]> = {
  academic: ACADEMIC_FORMS,
  non_academic: NON_ACADEMIC_FORMS,
};

/** Every form across both models, for lookups that do not know the model. Keys
 *  are unique across the two sets, so this is unambiguous. */
export const ALL_FORMS: CategoryForm[] = [...ACADEMIC_FORMS, ...NON_ACADEMIC_FORMS];

export function formsFor(model: AppraisalModel): CategoryForm[] {
  return FORMS_BY_MODEL[model];
}

// ---------------------------------------------------------------------------
// Worth assessment scheme — BACKGROUND ONLY
// ---------------------------------------------------------------------------

/** Quality percentage to worth. A stepped lookup, not a formula: 64% and 66%
 *  both yield 12. Confirmed as intended.
 *
 *  SECURITY: never serialise this to an API response or a client component.
 *  The client confirmed it must remain unknown to every user, the organization
 *  admin included. Import it only in server code. */
export const WORTH_BANDS: { min: number; max: number; worth: number }[] = [
  { min: 0,  max: 30,  worth: 0 },
  { min: 31, max: 33,  worth: 1 },
  { min: 34, max: 36,  worth: 2 },
  { min: 37, max: 39,  worth: 3 },
  { min: 40, max: 42,  worth: 4 },
  { min: 43, max: 45,  worth: 5 },
  { min: 46, max: 48,  worth: 6 },
  { min: 49, max: 51,  worth: 7 },
  { min: 52, max: 54,  worth: 8 },
  { min: 55, max: 57,  worth: 9 },
  { min: 58, max: 60,  worth: 10 },
  { min: 61, max: 63,  worth: 11 },
  { min: 64, max: 66,  worth: 12 },
  { min: 67, max: 69,  worth: 13 },
  { min: 70, max: 72,  worth: 14 },
  { min: 73, max: 75,  worth: 15 },
  { min: 76, max: 78,  worth: 16 },
  { min: 79, max: 81,  worth: 17 },
  { min: 82, max: 84,  worth: 18 },
  { min: 85, max: 87,  worth: 19 },
  { min: 88, max: 100, worth: 20 },
];

// ---------------------------------------------------------------------------
// Output quantification scheme
// ---------------------------------------------------------------------------

export type OutputType = 'research' | 'teaching' | 'admin_community';

export type QuantificationRule = {
  key: string;
  label: string;
  type: OutputType;
  /** Units earned per unit of `per`. */
  unitsPer: number;
  per: 'page' | 'semester_hour' | 'certified_work';
  /** Some teaching rules add a per-script allowance on top of the base rate. */
  perScript?: number;
  /** Patents and prototypes are scored in a range by sophistication, so the
   *  entered value is the unit count itself rather than a multiplier. */
  range?: { min: number; max: number };
  note?: string;
};

export const QUANTIFICATION_SCHEME: QuantificationRule[] = [
  {
    key: 'refereed_paper',
    label: 'Published papers in refereed journals or proceedings',
    type: 'research',
    unitsPer: 0.07,
    per: 'page',
    // Was 7 per page in the original scheme, which made a 2-page paper outscore
    // the professorial research target. Client corrected this to 0.07 on
    // 10 Aug 2026.
    note: 'Per page. Corrected from 7 to 0.07 by the client.',
  },
  {
    key: 'published_book',
    label: 'Published books',
    type: 'research',
    unitsPer: 0.01,
    per: 'page',
    note: 'Per page of text-standard book.',
  },
  {
    key: 'patent_design_prototype',
    label: 'Patents, designs, prototypes',
    type: 'research',
    unitsPer: 1,
    per: 'certified_work',
    range: { min: 1, max: 4 },
    note: 'One to four units of certified work by degree of sophistication.',
  },
  {
    key: 'monograph_technical',
    label: 'Monographs, technical papers, research reports, conference papers, abstracts',
    type: 'research',
    unitsPer: 0.02,
    per: 'page',
    note: 'Per page of certified copy.',
  },
  {
    key: 'theoretical_teaching',
    label: 'Theoretical subject taught',
    type: 'teaching',
    unitsPer: 1 / 15,
    per: 'semester_hour',
    perScript: 0.02,
    note: '1 unit per 15 semester hours, plus 0.02 per assessed script.',
  },
  {
    key: 'practical_teaching',
    label: 'Practical or clinical demonstration',
    type: 'teaching',
    unitsPer: 1 / 45,
    per: 'semester_hour',
    perScript: 0.02,
    note: '1 unit per 45 semester hours, plus 0.02 per assessed work or script.',
  },
  {
    key: 'admin_community',
    label: 'Administration and community services output',
    type: 'admin_community',
    unitsPer: 0.02,
    per: 'page',
    note: 'Per page of documented evidence, certified.',
  },
];

/** Student evaluation quantity has its own rule, outside the scheme table:
 *  the basic units of the course being appraised, plus 0.02 per student. */
export const STUDENT_QUANTITY_PER_STUDENT = 0.02;

// ---------------------------------------------------------------------------
// Positions and annual targets
// ---------------------------------------------------------------------------

export type PositionKey =
  | 'graduate_assistant'
  | 'assistant_lecturer'
  | 'lecturer_ii'
  | 'lecturer_i'
  | 'senior_lecturer'
  | 'professorial_cadre';

export const POSITIONS: { key: PositionKey; label: string }[] = [
  { key: 'graduate_assistant', label: 'Graduate Assistant' },
  { key: 'assistant_lecturer', label: 'Assistant Lecturer' },
  { key: 'lecturer_ii', label: 'Lecturer II' },
  { key: 'lecturer_i', label: 'Lecturer I' },
  { key: 'senior_lecturer', label: 'Senior Lecturer' },
  { key: 'professorial_cadre', label: 'Professorial Cadre' },
];

/** Annual targets by position and category. `null` means the client has not
 *  supplied a figure yet; scoring treats a null target as "category not
 *  targeted for this position" and leaves it out of the combined total rather
 *  than guessing a number.
 *
 *  Two deliberate readings, both reported to the client:
 *   - The source groups "Grade Asst / Asst. Lecturer" on one row with teaching
 *     "70 / 150". Totals reconcile only for 150 (150+25+18 = 193), so 150 is
 *     Assistant Lecturer and 70 is Graduate Assistant. They share the research
 *     and community figures, which the source states once for the grouped row.
 *   - The source's stated total for Lecturer I is 353, but its components sum
 *     to 354. Totals are computed from components here, never read from the
 *     stated total.
 *
 *  student_evaluation has no row in the source. Since the combined target is the
 *  sum across all five categories, it stays null until the client supplies it,
 *  and the combined RTP is reported as partial. */
export type AcademicCategoryKey = 'teaching' | 'research' | 'administration' | 'community';

export const ACADEMIC_TARGETS: Record<PositionKey, Record<AcademicCategoryKey, number | null>> = {
  graduate_assistant:  { teaching: 70,  research: 25,  administration: null, community: 18 },
  assistant_lecturer:  { teaching: 150, research: 25,  administration: null, community: 18 },
  lecturer_ii:         { teaching: 165, research: 70,  administration: null, community: 37 },
  lecturer_i:          { teaching: 192, research: 116, administration: null, community: 46 },
  senior_lecturer:     { teaching: 221, research: 168, administration: null, community: 56 },
  professorial_cadre:  { teaching: 252, research: 273, administration: null, community: 74 },
};

/** Administration is targeted by the post held rather than by academic position,
 *  so it is looked up separately and merged into the combined target. The source
 *  leaves a trailing "other ?" with no figure; that stays absent. */
export const ADMINISTRATIVE_POST_TARGETS: { key: string; label: string; target: number }[] = [
  { key: 'vice_chancellor', label: 'Vice Chancellor', target: 540 },
  { key: 'dvc_provost', label: 'DVC and Provost', target: 492 },
  { key: 'dean', label: 'Dean', target: 396 },
  { key: 'director_head', label: 'Director, Acting Head or Head', target: 140 },
  { key: 'hall_warden', label: 'Hall Warden', target: 90 },
];

/** Non-academic annual targets, supplied by the client on 10 Aug 2026. Keyed on
 *  grade, grouped into five cadre bands for display.
 *
 *  These are TOTAL annual targets covering all three categories, not per-category
 *  figures: grades 15, 16 and 17 (354, 445, 599) match the academic combined
 *  totals for Lecturer I, Senior Lecturer and Professorial exactly. That is also
 *  why the earlier "multiply the target by 2" rule no longer applies. */
export const NON_ACADEMIC_CADRES: { group: string; grades: string[]; roles?: string }[] = [
  { group: 'Support Services',    grades: ['grade_1', 'grade_2', 'grade_3', 'grade_4'], roles: 'Cleaner, Driver, Messenger, Security' },
  { group: 'Clerical/Technical',  grades: ['grade_5', 'grade_6', 'grade_7'],            roles: 'Clerk, Technician, Lab Assistant' },
  { group: 'Professional/Officer',grades: ['grade_8', 'grade_9', 'grade_10'],           roles: 'Accountant, HR officer, IT officer' },
  { group: 'Management',          grades: ['grade_11', 'grade_12', 'grade_13'],         roles: 'Head of unit, Manager, Principal officer' },
  { group: 'Executive',           grades: ['grade_14', 'grade_15', 'grade_16', 'grade_17'], roles: 'Director, Registrar, CFO, COO' },
];

export const NON_ACADEMIC_TARGETS: Record<string, number> = {
  grade_1: 110,  grade_2: 165,  grade_3: 192,  grade_4: 221,
  grade_5: 230,  grade_6: 241,  grade_7: 251,
  grade_8: 265,  grade_9: 275,  grade_10: 280,
  grade_11: 290, grade_12: 300, grade_13: 310,
  grade_14: 320, grade_15: 354, grade_16: 445, grade_17: 599,
};

// ---------------------------------------------------------------------------
// Performance grades and tolerance
// ---------------------------------------------------------------------------

export type Grade = 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';

/** Confirmed by the client's grade diagram, which resolved the overlap in the
 *  original wording: Good takes the ±5% band and owns BOTH its endpoints, so
 *  Very Good and Fair are open where they meet it and closed at ±25%.
 *
 *  The inclusivity flags matter. Without them −5 falls into Fair and −25 into
 *  Poor, which is one grade too harsh at each boundary. */
export const GRADE_BANDS: {
  grade: Grade;
  minRtp: number | null;
  minInclusive: boolean;
  maxRtp: number | null;
  maxInclusive: boolean;
  condition: string;
}[] = [
  { grade: 'Excellent', minRtp: 25,   minInclusive: false, maxRtp: null, maxInclusive: false, condition: 'More than 25% above target' },
  { grade: 'Very Good', minRtp: 5,    minInclusive: false, maxRtp: 25,   maxInclusive: true,  condition: 'Above 5% and up to 25% above target' },
  { grade: 'Good',      minRtp: -5,   minInclusive: true,  maxRtp: 5,    maxInclusive: true,  condition: 'Within 5% either side of target' },
  { grade: 'Fair',      minRtp: -25,  minInclusive: true,  maxRtp: -5,   maxInclusive: false, condition: 'Below 5% and down to 25% below target' },
  { grade: 'Poor',      minRtp: null, minInclusive: false, maxRtp: -25,  maxInclusive: false, condition: 'More than 25% below target' },
];

/** How far the appraisee's score may sit from the HOD's before the disagreement
 *  is escalated. BACKGROUND ONLY — the client confirmed neither staff nor HODs
 *  may see this, and a flag surfaces only to the organization admin. */
export const TOLERANCE_BAND: Record<AppraisalModel, number> = {
  // The original document set 5% for academic. The client's 10 Aug answers
  // restated the reconciliation rules using 10% throughout, so both models use
  // 10% here. Flagged back to them: if academic should stay at 5%, this is the
  // only line that changes.
  academic: 10,
  non_academic: 10,
};

/** Minimum completed student evaluation forms per course before that course can
 *  be scored. The recorded student evaluation result is the mean of them. The
 *  rule is conditional on the course having more than this many students. */
export const MIN_STUDENT_EVALUATIONS = 10;

/** Appraisal periods are configurable per organization by Estab./Personnel. */
export const APPRAISAL_PERIOD_FREQUENCIES = ['yearly', 'bi_annual', 'quarterly'] as const;
export type AppraisalPeriodFrequency = (typeof APPRAISAL_PERIOD_FREQUENCIES)[number];

/** Which quantification rules a given form may draw on. Keeps the evidence
 *  picker on each form short and relevant instead of listing all seven. */
export function rulesForForm(formKey: FormKey): QuantificationRule[] {
  switch (formKey) {
    case 'teaching_quality':
      return QUANTIFICATION_SCHEME.filter((r) => r.type === 'teaching');
    case 'research':
    case 'fault_solving':
      return QUANTIFICATION_SCHEME.filter((r) => r.type === 'research');
    case 'administration':
    case 'community':
    case 'activity':
    case 'training_quality':
      return QUANTIFICATION_SCHEME.filter((r) => r.type === 'admin_community');
    case 'student_evaluation':
      // Student evaluation has its own rule (basic units plus 0.02 per student),
      // so it never draws on the scheme table.
      return [];
  }
}

/** How a rule's measure is labelled on screen. */
export const MEASURE_LABEL: Record<QuantificationRule['per'], string> = {
  page: 'Pages',
  semester_hour: 'Semester hours',
  certified_work: 'Certified works',
};

/** Items (a) to (h) from the non-academic appraisal. Free text and yes/no, kept
 *  as a record rather than scored: the client presents it as context for the
 *  supervisor, not as part of the calculation. */
export type QuestionnaireItem = {
  key: string;
  prompt: string;
  type: 'text' | 'yes_no_text' | 'choice';
  options?: readonly string[];
  /** Set where the document asks for supporting evidence. */
  upload?: boolean;
};

/** The two questionnaires are DIFFERENT. The client corrected this on 11 Aug:
 *  non-academic staff answer the set on pages 95 to 97, academic staff the set
 *  on pages 98 to 99. An earlier version applied the non-academic set to both,
 *  and stopped at item (h) when it actually runs to (l). */
export const QUESTIONNAIRE_NON_ACADEMIC: QuestionnaireItem[] = [
  { key: 'a', type: 'text', prompt: 'State, in order of importance, the main duties you performed in your job during the period of report.' },
  { key: 'b', type: 'yes_no_text', prompt: 'Was there any joint discussion between you and your supervisor on how to accomplish the tasks, and when?' },
  { key: 'c', type: 'yes_no_text', prompt: 'Were you properly equipped professionally, technically and administratively to perform the jobs allotted to you? If not, what were your difficulties or constraints?' },
  { key: 'd', type: 'text', prompt: 'State the difficulties you met in carrying out your duties, and the efforts you and your supervisor made to rectify them.' },
  { key: 'e', type: 'text', prompt: 'What methods did your supervisor adopt to assist you in solving the difficult problems?' },
  { key: 'f', type: 'yes_no_text', prompt: 'Was there any periodic review (three or six monthly) of your methods by your supervisor to achieve the desired goals?' },
  { key: 'g', type: 'yes_no_text', prompt: 'After the review, did your performance measure up to the standards set at the beginning of the year?' },
  { key: 'h', type: 'text', prompt: 'If the answer to (g) is no, what solution or admonition was given for the shortcomings?' },
  { key: 'i', type: 'text', prompt: 'How did your performance relate to the total accomplishment of the goals set for your faculty, college, department or unit, and to the vision of the institution?' },
  { key: 'j', type: 'text', prompt: 'State any ad hoc duties performed during the period, if any.' },
  { key: 'k', type: 'choice', options: ['Positively', 'Negatively'], prompt: 'How did the performance of ad hoc duties affect your real duties? If negatively, did you bring this to the attention of your supervisor?' },
  { key: 'l', type: 'text', prompt: 'State the period you have been on the schedule of duty referred to in (a) above, from and to.' },
];

export const QUESTIONNAIRE_ACADEMIC: QuestionnaireItem[] = [
  { key: 'a', type: 'text', prompt: 'Looking back on the past year, which jobs assigned to you do you think you have undertaken satisfactorily?' },
  { key: 'b', type: 'text', prompt: 'What were the factors to which you ascribe your success, and which to your failure?' },
  { key: 'c', type: 'text', prompt: 'Based on your answers to (a) and (b), give your observations on the current challenges facing the institution and your suggestions on the way forward. Two pages at most.' },
  { key: 'd', type: 'yes_no_text', upload: true, prompt: 'Do you need more training or experience to do your job better, and if so what kind? Did you attend any training course this appraisal session, was an examination conducted afterwards, and if so upload the certificates awarded.' },
  { key: 'e', type: 'text', prompt: 'Is the most effective use being made of your capabilities in your present job?' },
  { key: 'f', type: 'text', prompt: 'Do you think your abilities could be better used in your present job, or in another kind of job?' },
  { key: 'g', type: 'yes_no_text', prompt: 'During the period of this report did you have job satisfaction? If not, what were the reasons?' },
  { key: 'h', type: 'text', prompt: 'Any other comment on issues not mentioned above?' },
  { key: 'i', type: 'text', prompt: 'Date the report was submitted to the reporting officer.' },
];

export function questionnaireFor(model: AppraisalModel): QuestionnaireItem[] {
  return model === 'academic' ? QUESTIONNAIRE_ACADEMIC : QUESTIONNAIRE_NON_ACADEMIC;
}

// ---------------------------------------------------------------------------
// Who may enter what
// ---------------------------------------------------------------------------

export const ORG_ADMIN_ROLES = ['super-admin', 'admin'];

/** Records Forms 8 and 9 for academic staff, and prints the blanks.
 *
 *  Confirmed by the client on 13 Aug 2026: the departmental administrator is a
 *  DIFFERENT person from the HOD. The document says as much on pages 20 to 21,
 *  where the "none-academic staff in-charge of the software in the department"
 *  verifies Forms 8 and 9 and a "superior GROUP HEAD/H.O.D" then approves.
 *
 *  Keeping them apart matters: the HOD's counter-score is meant to be
 *  independent of the appraisee's. If the HOD also recorded the student and peer
 *  scores they would control both sides, and the tolerance band, the accept or
 *  contest step and the auditor referral would all be hollow. */
export const DEPARTMENT_ADMIN_ROLES = ['dept-admin'];

/** Roles whose view is their whole department rather than just themselves.
 *
 *  The departmental administrator belongs here: they record Forms 8 and 9 for
 *  everyone in the department, so a list scoped to their own entry would make
 *  the role unusable. */
export const DEPARTMENT_SCOPED_ROLES = ['hod', 'unit-head', ...DEPARTMENT_ADMIN_ROLES];

/** Whether this person may fill in this form.
 *
 *  Shared by the server and the screens so the interface can never offer an
 *  input the server will refuse. The organization administrator enters nothing:
 *  their part is to open the period, run the evaluation and release results. */
export function mayEnterForm(opts: {
  role: string;
  formKey: FormKey;
  isOwnEntry: boolean;
}): boolean {
  if (ORG_ADMIN_ROLES.includes(opts.role)) return false;

  const form = ALL_FORMS.find((f) => f.key === opts.formKey);
  if (!form) return false;

  return form.enteredBy === 'department_admin'
    ? DEPARTMENT_ADMIN_ROLES.includes(opts.role)
    : opts.isOwnEntry;
}

// ---------------------------------------------------------------------------
// Where an appraisal has got to
// ---------------------------------------------------------------------------

export type AppraisalStage =
  | 'draft'
  | 'submitted'
  | 'verified'
  | 'awaiting_staff'
  | 'referred_to_auditor'
  | 'hod_reviewed'
  | 'approved';

/** The stages in order, with who each one waits on.
 *
 *  One definition so the entry screen, the lists and the departmental views all
 *  describe a session the same way. `waitingOn` is written for the person
 *  reading it, which is why every stage names a role rather than a status. */
export const APPRAISAL_STAGES: {
  key: AppraisalStage;
  label: string;
  waitingOn: string;
  /** Roles for whom this stage is their turn to act. */
  actor: string[];
}[] = [
  {
    key: 'draft',
    label: 'Being filled in',
    waitingOn: 'the member of staff and the departmental administrator',
    actor: ['lecturer', 'employee-w', 'industrial-engineer', 'dept-admin'],
  },
  {
    key: 'submitted',
    label: 'Awaiting departmental verification',
    waitingOn: 'the departmental administrator, who checks Forms 8 and 9 against the paper originals',
    actor: ['dept-admin'],
  },
  {
    key: 'verified',
    label: 'Awaiting the head of department',
    waitingOn: 'the head of department, who reviews each score',
    actor: ['hod'],
  },
  {
    key: 'awaiting_staff',
    label: 'Awaiting the member of staff',
    waitingOn: 'the member of staff, who accepts or contests the adjusted score',
    actor: ['lecturer', 'employee-w', 'industrial-engineer'],
  },
  {
    key: 'referred_to_auditor',
    label: 'With the appraisal auditor',
    waitingOn: 'the external auditor, whose decision is final',
    actor: ['auditor'],
  },
  {
    key: 'hod_reviewed',
    label: 'Reviewed, awaiting approval',
    waitingOn: 'the Dean, then Estab./Personnel to run the evaluation',
    actor: ['unit-head', 'admin', 'super-admin'],
  },
  {
    key: 'approved',
    label: 'Approved',
    waitingOn: 'Estab./Personnel to run the evaluation and release results',
    actor: ['admin', 'super-admin'],
  },
];

export function stageOf(status: string) {
  return APPRAISAL_STAGES.find((s) => s.key === status) ?? APPRAISAL_STAGES[0];
}

/** True when the stage is this person's turn, so the screen can say "your turn"
 *  rather than leaving them to work it out. */
export function isMyTurn(status: string, role: string): boolean {
  return stageOf(status).actor.includes(role);
}
