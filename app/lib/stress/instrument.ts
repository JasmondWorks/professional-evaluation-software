// The stress instrument — the single source of truth for the stress categories,
// their items, and each item's maximum weight. Form 5 (data entry) and the
// evaluation both derive from this, so the numbers can never drift between
// screens. Add/adjust a category or weight here and everything follows.

export type CategoryKey =
  | 'organizational'
  | 'student'
  | 'administrative'
  | 'teacher'
  | 'parents'
  | 'occupational'
  | 'personal'
  | 'academic_program'
  | 'negative_public_attitude'
  | 'misc';

export type StressItem = { label: string; max: number };
export type StressCategory = { key: CategoryKey; label: string; items: StressItem[] };

export const STRESS_INSTRUMENT: StressCategory[] = [
  {
    key: 'organizational',
    label: 'Organizational',
    items: [
      { label: 'Time', max: 116 },
      { label: 'Paper Work', max: 99 },
      { label: 'Lack of Materials', max: 34 },
      { label: 'Extra Duties', max: 32 },
      { label: 'Physical Plant', max: 19 },
      { label: 'Meetings', max: 15 },
      { label: 'Class Size', max: 15 },
      { label: 'Poor Scheduling', max: 13 },
      { label: 'Interruptions', max: 13 },
      { label: 'Travels', max: 12 },
      { label: 'Conflicting Demand', max: 11 },
      { label: 'Athletics', max: 4 },
    ],
  },
  {
    key: 'student',
    label: 'Student',
    items: [
      { label: 'Student Discipline', max: 97 },
      { label: 'Student Apathy', max: 38 },
      { label: 'Low Student Achievement', max: 37 },
      { label: 'Student Absences', max: 3 },
    ],
  },
  {
    key: 'administrative',
    label: 'Administrative',
    items: [
      { label: 'Unclear Expectations', max: 27 },
      { label: 'Lack of Knowledge or Expertise', max: 25 },
      { label: 'Lack of Support (Backing, Recognition)', max: 24 },
      { label: 'Inconsistency', max: 17 },
      { label: 'Unreasonable Expectations', max: 14 },
      { label: 'Poor Evaluation Procedures', max: 12 },
      { label: 'Indecisiveness', max: 10 },
      { label: 'Lack of Opportunities for Input', max: 10 },
      { label: 'Failure to Provide Resources', max: 7 },
      { label: 'Lack of Follow-Through', max: 6 },
      { label: 'Harassment', max: 5 },
      { label: 'Favoritism', max: 5 },
      { label: 'Miscellaneous', max: 4 },
    ],
  },
  {
    key: 'teacher',
    label: 'Teacher',
    items: [
      { label: 'Conflict or Lack of Cooperation', max: 59 },
      { label: 'Incompetence or Irresponsibility', max: 21 },
      { label: 'Negative Attitude', max: 7 },
      { label: 'Lack of Communication', max: 5 },
    ],
  },
  {
    key: 'parents',
    label: 'Parents',
    items: [
      { label: 'Interference', max: 24 },
      { label: 'Nonsupport or Apathy', max: 15 },
      { label: 'Lack of Communication & Understanding', max: 11 },
    ],
  },
  {
    key: 'occupational',
    label: 'Occupational',
    items: [
      { label: 'Lack of Professional Growth', max: 12 },
      { label: 'Low Salary', max: 9 },
      { label: 'Lack of Advancement', max: 5 },
      { label: 'Job Insecurity', max: 4 },
    ],
  },
  {
    key: 'personal',
    label: 'Personal',
    items: [
      { label: 'Professional/Personal Conflict', max: 12 },
      { label: 'Conflict With Personal Values', max: 10 },
      { label: 'Miscellaneous', max: 4 },
    ],
  },
  {
    key: 'academic_program',
    label: 'Academic Program',
    items: [
      { label: 'Repetition', max: 7 },
      { label: 'Unrealistic Goals', max: 7 },
      { label: 'Low Standards', max: 5 },
      { label: 'Responsibility to Grade Students', max: 4 },
    ],
  },
  {
    key: 'negative_public_attitude',
    label: 'Negative Public Attitude',
    items: [{ label: 'Negative Public Attitude', max: 9 }],
  },
  {
    key: 'misc',
    label: 'Miscellaneous',
    items: [{ label: 'Miscellaneous', max: 27 }],
  },
];

export const CATEGORY_KEYS: CategoryKey[] = STRESS_INSTRUMENT.map((c) => c.key);

export const CATEGORY_LABEL: Record<CategoryKey, string> = Object.fromEntries(
  STRESS_INSTRUMENT.map((c) => [c.key, c.label]),
) as Record<CategoryKey, string>;

// The maximum possible value for each category = the sum of its item weights
// (e.g. Organizational = 383). Derived, never hardcoded.
export const CATEGORY_MAX: Record<CategoryKey, number> = Object.fromEntries(
  STRESS_INSTRUMENT.map((c) => [c.key, c.items.reduce((s, i) => s + i.max, 0)]),
) as Record<CategoryKey, number>;

// Which categories feed each factor (confirmed from the evaluation logic).
export const STRESS_CATEGORIES: CategoryKey[] = CATEGORY_KEYS; // all 10
export const PRESSURE_CATEGORIES: CategoryKey[] = [
  'organizational',
  'student',
  'administrative',
  'academic_program',
  'negative_public_attitude',
];
export const CONFLICT_CATEGORIES: CategoryKey[] = [
  'organizational',
  'student',
  'administrative',
  'teacher',
  'parents',
  'academic_program',
];
