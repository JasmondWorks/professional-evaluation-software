// The appraisal half of the motivation model.
//
// From the lower table of the client's PERFORMANCE MOTIVATION TEMPLATE
// (30 Aug 2026), "To be applied to Appraisal model for both Academic and Non
// Academic". It is a different shape from the performance half: those awards
// follow from a grade crossing a threshold, while most of these are
// competitive — "the highest Excellent score in Research from each Faculty" —
// so they need the whole cohort ranked, not one person's result read.
//
// Three kinds of rule appear in the table:
//
//   top      the best scorer in one appraisal category within a scope, among
//            those who reached a named grade
//   grade    a threshold on this year's grade, in a category or overall
//   streak   N consecutive years at a grade (Books of Records, Hall of Fame)
//
// The rest — promotions, reprimands, gifts, training, finance — hang off the
// overall grade and the establishment's own discretion, so they are listed with
// their criteria and left for the admin to award rather than computed.

import type { PerformanceLevel } from './scheme';

export type AppraisalCategory = 'teaching' | 'research' | 'administration' | 'community';

export const CATEGORY_LABELS: Record<AppraisalCategory, string> = {
  teaching: 'Teaching',
  research: 'Research',
  administration: 'Administration',
  community: 'Community Service',
};

/** One staff member's released appraisal, as the engine needs it. */
export type StaffResult = {
  name: string;
  dept: string | null;
  faculty: string | null;
  /** Senior Lecturer and above vs Assistant Lecturer, for the junior/senior awards. */
  cadre: 'junior' | 'senior' | null;
  overallGrade: PerformanceLevel | null;
  overallPercent: number | null;
  scores: Partial<Record<AppraisalCategory, number>>;
  grades: Partial<Record<AppraisalCategory, PerformanceLevel>>;
  /** Consecutive released periods at or above each grade, most recent first. */
  consecutiveVeryGood?: number;
  consecutiveExcellent?: number;
};

export type Scope = 'department' | 'faculty' | 'institution';

export type AwardRule =
  | { kind: 'top'; category: AppraisalCategory; grade: PerformanceLevel; scope: Scope; cadre?: 'junior' | 'senior' }
  | { kind: 'grade'; category: AppraisalCategory | 'overall'; grade: PerformanceLevel }
  | { kind: 'streak'; years: number; grade: PerformanceLevel }
  | { kind: 'manual' };

export type AppraisalAward = {
  key: string;
  /** The document's own name for it. */
  label: string;
  criteria: string;
  rule: AwardRule;
  /** Which badge or certificate art this award prints on, when it prints. */
  art?: 'badge-1st' | 'badge-2nd' | 'badge-3rd' | 'book-1st' | 'book-2nd' | 'cert-1st' | 'cert-2nd' | 'cert-3rd';
};

export type AwardCategory = {
  no: number;
  title: string;
  awards: AppraisalAward[];
};

// ---------------------------------------------------------------------------
// 1. Best Performer Identity Display
// ---------------------------------------------------------------------------

const identityDisplay: AppraisalAward[] = [
  { key: 'inst-excellent-researchers', label: 'List of Institution Excellent Researchers', criteria: 'Academic staff with the highest "Excellent" score in Research from each Faculty.', rule: { kind: 'top', category: 'research', grade: 'Excellent', scope: 'faculty' }, art: 'badge-1st' },
  { key: 'inst-very-good-researchers', label: 'List of Institution Very Good Researchers', criteria: 'Those with the highest "Very Good" score in Research from each Faculty.', rule: { kind: 'top', category: 'research', grade: 'Very Good', scope: 'faculty' }, art: 'badge-2nd' },
  { key: 'inst-excellent-teachers', label: 'List of Institution Excellent Teachers', criteria: 'Those with the highest "Excellent" score in Teaching from each Faculty.', rule: { kind: 'top', category: 'teaching', grade: 'Excellent', scope: 'faculty' }, art: 'badge-1st' },
  { key: 'inst-very-good-teachers', label: 'List of Institution Very Good Teachers', criteria: 'Highest "Very Good" score in Teaching from each Faculty.', rule: { kind: 'top', category: 'teaching', grade: 'Very Good', scope: 'faculty' }, art: 'badge-2nd' },
  { key: 'inst-excellent-community', label: 'List of Institution Excellent Community Servicers', criteria: 'Highest "Excellent" performer in internal Community Services from each Faculty.', rule: { kind: 'top', category: 'community', grade: 'Excellent', scope: 'faculty' }, art: 'badge-1st' },
  { key: 'inst-very-good-community', label: 'List of Institution Very Good Community Servicers', criteria: 'Highest "Very Good" performer in internal Community Services from each Faculty.', rule: { kind: 'top', category: 'community', grade: 'Very Good', scope: 'faculty' }, art: 'badge-2nd' },
  { key: 'inst-excellent-administrators', label: 'List of Institution Excellent Administrators', criteria: 'Highest "Excellent" Administrator from each Faculty.', rule: { kind: 'top', category: 'administration', grade: 'Excellent', scope: 'faculty' }, art: 'badge-1st' },
  { key: 'inst-very-good-administrators', label: 'List of Institution Very Good Administrators', criteria: 'Highest scoring "Very Good" Administrator from each Faculty.', rule: { kind: 'top', category: 'administration', grade: 'Very Good', scope: 'faculty' }, art: 'badge-2nd' },
  { key: 'dept-junior-researcher', label: 'Department Junior Researcher of the Year', criteria: 'Highest "Excellent" performer in Research from each Department.', rule: { kind: 'top', category: 'research', grade: 'Excellent', scope: 'department', cadre: 'junior' }, art: 'badge-1st' },
  { key: 'faculty-junior-researcher', label: 'Faculty Junior Researcher of the Year', criteria: 'Highest "Excellent" performer (Assistant Lecturer) in Research within the Faculty.', rule: { kind: 'top', category: 'research', grade: 'Excellent', scope: 'faculty', cadre: 'junior' }, art: 'badge-1st' },
  { key: 'faculty-senior-researcher', label: 'Faculty Senior Researcher of the Year', criteria: 'Highest "Excellent" performer, Senior Lecturer to Professor, in Research within the Faculty.', rule: { kind: 'top', category: 'research', grade: 'Excellent', scope: 'faculty', cadre: 'senior' }, art: 'badge-1st' },
  { key: 'faculty-author', label: 'Faculty Author of the Year', criteria: 'Author of a book within the Faculty assessed to rank "Excellent" and the best from the Faculty.', rule: { kind: 'manual' }, art: 'badge-1st' },
  { key: 'inst-author', label: 'Institution Author of the Year', criteria: 'As Faculty Author of the Year, but across all authors in the institution for the year.', rule: { kind: 'manual' }, art: 'badge-1st' },
  { key: 'dept-junior-teacher', label: 'Department Junior Teacher of the Year', criteria: 'Highest "Excellent" performer (Assistant Lecturer I) in Teaching within the Department.', rule: { kind: 'top', category: 'teaching', grade: 'Excellent', scope: 'department', cadre: 'junior' }, art: 'badge-1st' },
  { key: 'faculty-junior-teacher', label: 'Faculty Junior Teacher of the Year', criteria: 'Highest "Excellent" performer (Assistant Lecturer I) in Teaching within the Faculty.', rule: { kind: 'top', category: 'teaching', grade: 'Excellent', scope: 'faculty', cadre: 'junior' }, art: 'badge-1st' },
  { key: 'dept-senior-teacher', label: 'Department Senior Teacher of the Year', criteria: 'As above, but for Senior Lecturers to Professors.', rule: { kind: 'top', category: 'teaching', grade: 'Excellent', scope: 'department', cadre: 'senior' }, art: 'badge-1st' },
  { key: 'second-book-of-records', label: 'Institution 2nd Book of Records', criteria: '"Very Good" overall for 4 consecutive years.', rule: { kind: 'streak', years: 4, grade: 'Very Good' }, art: 'book-2nd' },
  { key: 'first-book-of-records', label: 'Institution 1st Book of Records', criteria: '"Very Good" overall for 5 consecutive years.', rule: { kind: 'streak', years: 5, grade: 'Very Good' }, art: 'book-1st' },
  { key: 'hall-of-fame', label: 'Institution Hall of Fame Membership', criteria: '"Excellent" overall performance for 5 consecutive years.', rule: { kind: 'streak', years: 5, grade: 'Excellent' }, art: 'book-1st' },
];

// ---------------------------------------------------------------------------
// 2. Achievement Certificates
// ---------------------------------------------------------------------------

const certificate = (
  key: string,
  label: string,
  criteria: string,
  category: AppraisalCategory | 'overall',
  grade: PerformanceLevel,
): AppraisalAward => ({
  key,
  label,
  criteria,
  rule: { kind: 'grade', category, grade },
  art: grade === 'Excellent' ? 'cert-1st' : 'cert-2nd',
});

const certificates: AppraisalAward[] = [
  certificate('cert-excellent-teacher', 'Excellent Teacher Award', 'Annual grade of Excellent in Teaching.', 'teaching', 'Excellent'),
  certificate('cert-very-good-teacher', 'Very Good Teacher Award', 'Annual grade of Very Good in Teaching.', 'teaching', 'Very Good'),
  certificate('cert-excellent-researcher', 'Excellent Researcher Award', 'Annual grade of Excellent in Research.', 'research', 'Excellent'),
  certificate('cert-very-good-researcher', 'Very Good Researcher Award', 'Annual grade of Very Good in Research.', 'research', 'Very Good'),
  certificate('cert-excellent-administrator', 'Excellent Administrator Award', 'Annual grade of Excellent in Administration.', 'administration', 'Excellent'),
  certificate('cert-very-good-administrator', 'Very Good Administrator Award', 'Annual grade of Very Good in Administration.', 'administration', 'Very Good'),
  certificate('cert-excellent-community', 'Excellent Community Servicer Award', 'Annual grade of Excellent in Community Services.', 'community', 'Excellent'),
  certificate('cert-very-good-community', 'Very Good Community Servicer Award', 'Annual grade of Very Good in Community Services.', 'community', 'Very Good'),
  certificate('cert-excellent-academician', 'Excellent Academician Award', 'Annual overall grade of Excellent.', 'overall', 'Excellent'),
  certificate('cert-very-good-academician', 'Very Good Academician Award', 'Annual overall grade of Very Good.', 'overall', 'Very Good'),
];

// ---------------------------------------------------------------------------
// 3-7. The rest, which the establishment awards on the stated criteria
// ---------------------------------------------------------------------------

const manual = (key: string, label: string, criteria: string): AppraisalAward => ({
  key,
  label,
  criteria,
  rule: { kind: 'manual' },
});

export const APPRAISAL_AWARD_CATEGORIES: AwardCategory[] = [
  { no: 1, title: 'Best Performer Identity Display', awards: identityDisplay },
  { no: 2, title: 'Achievement Certificate', awards: certificates },
  {
    no: 3,
    title: 'Promotion',
    awards: [
      manual('rank-promotion', 'Rank Promotion', '3-year "Excellent" overall performance plus regular promotion requirements.'),
      manual('position-promotion', 'Promotion into existing positions', 'Regular promotion requirements.'),
      manual('step-promotion', 'Step Incremental Promotion', '3-year "Excellent" overall performance.'),
    ],
  },
  {
    no: 4,
    title: 'Reprimands',
    awards: [
      manual('reprimand-counselling', 'Counselling', '"Poor" or "Fair" annual overall performance.'),
      manual('reprimand-warning', 'Warning', '"Poor" or "Fair" 2-yearly to 4-yearly overall performance.'),
      manual('reprimand-layoff', 'Lay-Offs', '"Poor" 4-yearly or "Fair" 5-yearly overall performance below 35%.'),
    ],
  },
  {
    no: 5,
    title: 'Gifts',
    awards: [
      manual('gift-communication', 'Communication devices: radios, videos, mobile phones, televisions, computers', 'Annual and 3-years above "Good" performance.'),
      manual('gift-semi-monumental', 'Semi-monumental: bicycles, motorcycles, vehicles', 'Annual and 4-years above "Very Good" performance.'),
      manual('gift-monumental', 'Monumental: land, houses', '5-years overall "Very Good", "Excellent" or "Very Outstanding".'),
      manual('gift-books', 'Books', 'Annual and 4-years performance from "Very Good" to "Excellent".'),
      manual('gift-wares', 'Wares and household items', 'As books.'),
      manual('gift-clothes', 'Custom-made clothes', 'As books.'),
    ],
  },
  {
    no: 6,
    title: 'Training, Scholarship and Fellowship',
    awards: [
      manual('training-specialist', 'Specialist Training', 'Best overall cumulative performance.'),
      manual('training-selective', 'Selective Training', '"Very Good" to "Excellent" 3-year overall performance.'),
      manual('training-deficiency', 'Deficiency Training', '"Poor" to "Fair" annual to 3-year overall performance.'),
      manual('training-leadership', 'Leadership Training', 'As selective training.'),
      manual('training-scholarship', 'Special Scholarship Award or Fellowship', 'As selective training.'),
    ],
  },
  {
    no: 7,
    title: 'Finance',
    awards: [
      manual(
        'finance-token',
        'Token money accompanying every achievement certificate, rank promotion, identity display, souvenir and monumental gift',
        'Based on the criteria for winning the other motivators; the establishment decides the amount according to what it can afford.',
      ),
    ],
  },
];

export const ALL_APPRAISAL_AWARDS = APPRAISAL_AWARD_CATEGORIES.flatMap((c) => c.awards);

// ---------------------------------------------------------------------------
// Working out who has won what
// ---------------------------------------------------------------------------

export type Winner = {
  name: string;
  dept: string | null;
  faculty: string | null;
  /** The figure that won it, for the "highest score" awards. */
  score?: number;
  scopeLabel?: string;
};

export type AwardOutcome = {
  award: AppraisalAward;
  winners: Winner[];
  /** Set when the award cannot be decided yet, with the reason to show. */
  pending?: string;
};

function scopeKey(s: StaffResult, scope: Scope): string {
  if (scope === 'department') return s.dept ?? '—';
  if (scope === 'faculty') return s.faculty ?? '—';
  return 'Institution';
}

export function determineAwards(
  staff: StaffResult[],
  /** How many consecutive released periods the organization actually has. The
   *  streak awards cannot be judged on less, and saying so beats showing an
   *  empty list that looks like a fault. */
  releasedPeriods: number,
): AwardOutcome[] {
  return ALL_APPRAISAL_AWARDS.map((award): AwardOutcome => {
    const rule = award.rule;

    if (rule.kind === 'manual') {
      return {
        award,
        winners: [],
        pending: 'Awarded by the establishment on the stated criteria.',
      };
    }

    if (rule.kind === 'streak') {
      if (releasedPeriods < rule.years) {
        return {
          award,
          winners: [],
          pending: `Needs ${rule.years} consecutive years of released results; the organization has ${releasedPeriods}.`,
        };
      }
      const field = rule.grade === 'Excellent' ? 'consecutiveExcellent' : 'consecutiveVeryGood';
      const winners = staff
        .filter((s) => (s[field] ?? 0) >= rule.years)
        .map((s) => ({ name: s.name, dept: s.dept, faculty: s.faculty }));
      return { award, winners };
    }

    if (rule.kind === 'grade') {
      const winners = staff
        .filter((s) =>
          rule.category === 'overall'
            ? s.overallGrade === rule.grade
            : s.grades[rule.category] === rule.grade,
        )
        .map((s) => ({
          name: s.name,
          dept: s.dept,
          faculty: s.faculty,
          score:
            rule.category === 'overall'
              ? (s.overallPercent ?? undefined)
              : s.scores[rule.category],
        }));
      return { award, winners };
    }

    // top — one winner per scope, and only among those who reached the grade.
    const eligible = staff.filter((s) => {
      if (s.grades[rule.category] !== rule.grade) return false;
      if (rule.cadre && s.cadre !== rule.cadre) return false;
      return Number.isFinite(s.scores[rule.category]);
    });

    const byScope = new Map<string, StaffResult[]>();
    for (const s of eligible) {
      const key = scopeKey(s, rule.scope);
      byScope.set(key, [...(byScope.get(key) ?? []), s]);
    }

    const winners: Winner[] = [];
    for (const [key, group] of byScope) {
      const best = group.reduce((a, b) =>
        (b.scores[rule.category] ?? -Infinity) > (a.scores[rule.category] ?? -Infinity) ? b : a,
      );
      winners.push({
        name: best.name,
        dept: best.dept,
        faculty: best.faculty,
        score: best.scores[rule.category],
        scopeLabel: key,
      });
    }

    return { award, winners };
  });
}
