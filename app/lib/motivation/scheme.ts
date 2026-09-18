// The motivation model, from pages 102-109 of the client's document.
//
// What was here before was an invented weighted survey — "Job Satisfaction,
// weight 0.2" and so on — which appears nowhere in the document. The document
// describes something quite different, and in two halves:
//
//   1. A catalogue of motivators the head of the establishment (VC/MD) chooses
//      from at the start of a tenure. Some are marked compulsory and cannot be
//      deselected. The choice is saved against that administration, and the IT
//      admin resets it when top management changes.
//
//   2. A Motivation Action Scheme: a matrix of performance level against period
//      that says what is due to a member of staff — from counselling and
//      warnings at the bottom to monumental gifts and promotion at the top.
//
// Nothing here is scored. The performance and appraisal models produce the
// grade; this decides what follows from it.

export type PerformanceLevel =
  | 'Very Poor'
  | 'Poor'
  | 'Fair'
  | 'Good'
  | 'Very Good'
  | 'Excellent'
  | 'Very Outstanding';

export const PERFORMANCE_LEVELS: PerformanceLevel[] = [
  'Very Poor',
  'Poor',
  'Fair',
  'Good',
  'Very Good',
  'Excellent',
  'Very Outstanding',
];

// The periods of the client's PERFORMANCE MOTIVATION TEMPLATE (30 Aug 2026),
// which supersedes the monthly/quarterly/biannual scheme on page 108 of the
// original document for the performance model.
export type Period = 'annual' | 'two-year' | 'three-year' | 'four-year' | 'five-year';

export const PERIODS: { key: Period; label: string }[] = [
  { key: 'annual', label: 'Annually' },
  { key: 'two-year', label: '2-Year' },
  { key: 'three-year', label: '3-Yearly' },
  { key: 'four-year', label: '4-Yearly' },
  { key: 'five-year', label: '5-Yearly' },
];

// ---------------------------------------------------------------------------
// 1. The motivator catalogue (pages 102-104)
// ---------------------------------------------------------------------------

export type Motivator = {
  key: string;
  label: string;
  /** Starred in the original document. It used to lock the checkbox; the client
   *  asked on 30 Aug for these to be selectable like everything else, so the
   *  star is now a recommendation the establishment can decline. */
  recommended?: boolean;
};

export type MotivatorGroup = {
  key: string;
  title: string;
  note?: string;
  /** The head may add their own items to this group. */
  allowsAdditions?: boolean;
  items: Motivator[];
};

export const MOTIVATOR_GROUPS: MotivatorGroup[] = [
  {
    key: 'training',
    title: 'Training',
    items: [
      { key: 'sponsorship-higher-education', label: 'Sponsorship to higher education in specialist areas (Grade level 1-7)' },
      { key: 'short-term-programmes', label: 'Specialist short-term programmes: workshops, conferences, seminars' },
      { key: 'educational-scholarships', label: 'Educational scholarships for staff (junior and senior, excluding top management)' },
      { key: 'new-employee-training', label: 'Adequate training for new employees' },
      { key: 'in-house-reprimand-training', label: 'In-house training for reprimands', recommended: true },
      { key: 'specialist-training', label: 'Specialist training', recommended: true },
      { key: 'selective-training', label: 'Selective training', recommended: true },
      { key: 'deficiency-training', label: 'Deficiency training', recommended: true },
      { key: 'special-scholarship', label: 'Special scholarship', recommended: true },
      { key: 'special-counselling', label: 'Special counselling unit for very poor graded staff', recommended: true },
    ],
  },
  {
    key: 'fringe',
    title: 'Non-financial fringe benefits',
    allowsAdditions: true,
    items: [
      { key: 'transport-plan', label: 'Staff transportation plan' },
      { key: 'canteen-subsidy', label: 'Staff canteen subsidy' },
      { key: 'uniform', label: 'Uniform for workers (where applicable)' },
      { key: 'medical-scheme', label: 'Staff medical scheme' },
      { key: 'housing-loan', label: 'Staff housing loan' },
      { key: 'sports-travel', label: 'Travelling for sports and games' },
      { key: 'insurance', label: 'Insurance' },
      { key: 'promotions', label: 'Promotions' },
    ],
  },
  {
    key: 'financial',
    title: 'Financial staff sustenance (enforced in monthly salary)',
    allowsAdditions: true,
    items: [
      { key: 'housing-allowance', label: 'Housing allowance' },
      { key: 'salary-increase', label: 'Mass increase in salaries, as at when due' },
      { key: 'transport-allowance', label: 'Transport allowance' },
      { key: 'leave-allowance', label: 'Leave allowance' },
      { key: 'feeding-allowance', label: 'Feeding allowance' },
      { key: 'gifts-allowance', label: 'Gifts' },
      { key: 'study-allowance', label: 'Study allowance' },
      { key: 'lunch-allowance', label: 'Lunch allowance' },
      { key: 'christmas-bonus', label: 'Christmas bonus' },
    ],
  },
  {
    key: 'trophies',
    title: 'Trophy awards',
    items: [
      { key: 'gold-trophy', label: 'Gold trophy' },
      { key: 'silver-trophy', label: 'Silver trophy' },
      { key: 'bronze-trophy', label: 'Bronze trophy' },
    ],
  },
  {
    key: 'displays',
    title: 'Best workers identity display',
    items: [
      { key: 'best-of-month', label: 'Best worker of the month picture' },
      { key: 'best-of-quarter', label: 'Best worker of the quarter picture' },
      { key: 'best-biannual', label: 'Biannual best workers picture' },
      { key: 'best-annual', label: 'Annual best workers picture' },
      { key: 'second-list', label: '2nd list of best performers in assorted parameters' },
      { key: 'first-list', label: '1st list of best performers in assorted parameters' },
      { key: 'second-book', label: '2nd Book of Records' },
      { key: 'first-book', label: '1st Book of Records' },
      { key: 'hall-of-fame', label: 'Member of the Hall of Fame' },
    ],
  },
  {
    key: 'gifts',
    title: 'Gifts',
    items: [
      { key: 'communication-devices', label: 'Communication devices: radios, videos, phones, televisions, computers' },
      { key: 'semi-monumental', label: 'Semi-monumental: bicycles, motorcycles, vehicles' },
      { key: 'monumental', label: 'Monumental: land, houses' },
      { key: 'books', label: 'Books' },
      { key: 'wares', label: 'Wares and household items' },
      { key: 'clothes', label: 'Custom-made clothes' },
    ],
  },
  {
    key: 'promotion',
    title: 'Promotion',
    items: [
      { key: 'rank-promotion', label: 'Rank promotion' },
      { key: 'position-promotion', label: 'Promotion into existing positions' },
      { key: 'step-promotion', label: 'Step incremental promotion' },
    ],
  },
];

/** Every motivator the document marks with *. Offered pre-ticked on a fresh
 *  scheme, but the establishment may untick any of them. */
export const RECOMMENDED_KEYS = MOTIVATOR_GROUPS.flatMap((g) =>
  g.items.filter((i) => i.recommended).map((i) => i.key),
);

// ---------------------------------------------------------------------------
// 2. Achievement certificates (pages 104-107)
// ---------------------------------------------------------------------------

/** The certificates the software issues. Every one of them comes in three
 *  classes, and the class follows the grade: "Very Good" earns 3rd class,
 *  "Excellent" 2nd, "Very Outstanding" 1st — quarterly, biannually, annually. */
export const CERTIFICATE_TYPES = [
  'Competence',
  'Integrity',
  'Compatibility',
  'Prudence / Use of resources',
  'Management',
  'Productivity',
  'Loyalty',
  'Leadership',
  'Diligence',
  'Natural Motivation',
  'Public Relation',
  'Punctuality and Regularity',
  'Devotion / Dedication',
  'Honesty',
  'Team Cooperation',
  'Quality Performance',
  'Creativity',
  'Planning',
] as const;

export type CertificateClass = '1st class' | '2nd class' | '3rd class';

/** Which class of certificate a grade earns, if any. */
export function certificateClassFor(level: PerformanceLevel): CertificateClass | null {
  if (level === 'Very Outstanding') return '1st class';
  if (level === 'Excellent') return '2nd class';
  if (level === 'Very Good') return '3rd class';
  return null;
}

// ---------------------------------------------------------------------------
// 3. The Motivation Action Scheme (page 108)
// ---------------------------------------------------------------------------

/** What is due at a given performance level for a given period. Transcribed
 *  from the document's matrix; a blank cell there is an empty list here. */
const ACTION_SCHEME: Record<PerformanceLevel, Partial<Record<Period, string[]>>> = {
  // The template has no Very Poor row. It is the level below Poor in the same
  // grading scheme, so it carries Poor's actions brought forward a period: the
  // written warning arrives annually rather than at two years, and the lay-off
  // at four years rather than five. Confirmed with the client 30 Aug.
  'Very Poor': {
    annual: ['Written warning (By Estab. Department) and deficiency training in areas found lacking'],
    'two-year': ['Stern written warning at the end of period (By Estab. Department)'],
    'three-year': ['Last stern warning (By Estab. Department)'],
    'four-year': ['Lay-off at the end of the period'],
  },
  Poor: {
    annual: ['Counselling (By Organization Counselling Unit)'],
    'two-year': [
      'Written warning (By Estab. Department) and deficiency training in areas found lacking',
    ],
    'three-year': ['Stern written warning at the end of period (By Estab. Department)'],
    'four-year': ['Lay-off at the end of the period'],
  },
  Fair: {
    annual: ['Counselling (By Organization Counselling Unit)'],
    'two-year': ['Written advice and deficiency training (By Organization Counselling Unit)'],
    'three-year': ['Written warning at the end of period (By Organization Counselling Unit)'],
    'four-year': ['Stern written warning at the end of period (By Organization Counselling Unit)'],
    'five-year': ['Lay-off those with under 35% overall performance at the end of the period'],
  },
  Good: {
    annual: ['Letter of commendation (By Estab. Department)'],
    'two-year': ['Letter of commendation (By Estab. Department)'],
    'three-year': ['Letter of commendation (By Estab. Department)'],
    'four-year': ['Letter of commendation (By Estab. Department)'],
    'five-year': ['Letter of commendation (By Estab. Department)'],
  },
  'Very Good': {
    annual: ['Assorted Very Good performer displays, awards and badges'],
    'two-year': [
      'As annually, plus lower level communication device gifts, books/cash and badges',
    ],
    'three-year': [
      'As 2-yearly, plus certificates and special selective training scholarship, fellowships and promotion if any',
    ],
    'four-year': [
      'As 3-yearly, 2nd Book of Records with certificate, plus lower level semi-monumental gifts and cash',
    ],
    'five-year': [
      '1st Book of Records with certificate, promotions, lower level monumental gifts, cash',
    ],
  },
  Excellent: {
    annual: ['Assorted Excellent performer displays and awards with certificate'],
    'two-year': [
      'As annually, plus higher level communication devices as gifts, books/cash, certificate',
    ],
    'three-year': [
      'As 2-yearly, 2nd Book of Records with certificate, plus selective training, fellowships/scholarship and promotion if any',
    ],
    'four-year': [
      'As 3-yearly, 1st Book of Records with certificate, plus higher level semi-monumental gifts and cash and promotion if any',
    ],
    'five-year': [
      'Hall of Fame membership with certificate, rank promotions, higher level monumental gifts, cash',
    ],
  },
  // The template stops at Excellent. Very Outstanding is the level above it in
  // the same scheme, so it takes Excellent's actions at their fullest: the Hall
  // of Fame arrives a period earlier and the annual award is 1st class.
  'Very Outstanding': {
    annual: ['Assorted 1st class performer displays and awards with certificate'],
    'two-year': [
      'As annually, plus higher level communication devices as gifts, books/cash, certificate',
    ],
    'three-year': [
      'As 2-yearly, 1st Book of Records with certificate, plus selective training, fellowships/scholarship and promotion if any',
    ],
    'four-year': [
      'Hall of Fame membership with certificate, plus higher level semi-monumental gifts, cash and promotion if any',
    ],
    'five-year': [
      'Hall of Fame membership with certificate, rank promotions, higher level monumental gifts, cash',
    ],
  },
};

/** What the scheme says is due, before the establishment's own selection is
 *  applied. An empty list means the matrix leaves that cell blank. */
export function actionsFor(level: PerformanceLevel, period: Period): string[] {
  return ACTION_SCHEME[level]?.[period] ?? [];
}

/** The whole matrix, for the table the admin reads. */
export function actionScheme(): Record<PerformanceLevel, Partial<Record<Period, string[]>>> {
  return ACTION_SCHEME;
}

// ---------------------------------------------------------------------------
// 4. What a given member of staff is due
// ---------------------------------------------------------------------------

export type Entitlement = {
  level: PerformanceLevel;
  period: Period;
  /** Straight from the action scheme. */
  actions: string[];
  /** The class of achievement certificate earned, if any. */
  certificateClass: CertificateClass | null;
  /** Motivators from the catalogue that this grade qualifies for, filtered to
   *  the ones the establishment actually adopted this tenure. */
  motivators: string[];
  /** Set when the scheme calls for a sanction rather than an award. */
  disciplinary: boolean;
};

/** Winning criteria from page 104-107, expressed as the levels that earn each
 *  catalogue motivator over a given period. */
function qualifyingMotivators(level: PerformanceLevel, period: Period): string[] {
  const out: string[] = [];
  const good = ['Good', 'Very Good', 'Excellent', 'Very Outstanding'].includes(level);
  const strong = ['Very Good', 'Excellent', 'Very Outstanding'].includes(level);

  if (level === 'Very Poor' || level === 'Poor') {
    out.push('special-counselling', 'deficiency-training');
  }
  if (level === 'Fair') {
    out.push('deficiency-training');
    // "Skills improvement" and leadership training run from Very Poor to Fair.
    out.push('in-house-reprimand-training');
  }
  if (strong) {
    out.push('selective-training', 'special-scholarship');
  }
  if (good) {
    if (period === 'annual') out.push('best-annual', 'books', 'wares', 'clothes');
    if (period === 'two-year') out.push('communication-devices', 'books');
    if (period === 'three-year') out.push('communication-devices', 'semi-monumental');
  }
  if (period === 'three-year' && strong) {
    out.push('selective-training', 'special-scholarship', 'position-promotion');
  }
  if (period === 'four-year') {
    if (level === 'Very Good') out.push('second-book', 'semi-monumental');
    if (level === 'Excellent') out.push('first-book', 'semi-monumental');
    if (level === 'Very Outstanding') out.push('hall-of-fame', 'semi-monumental');
  }
  if (period === 'five-year') {
    if (level === 'Very Good') out.push('first-book', 'monumental', 'step-promotion');
    if (level === 'Excellent' || level === 'Very Outstanding') {
      out.push('hall-of-fame', 'monumental', 'rank-promotion');
    }
  }
  return Array.from(new Set(out));
}

export function entitlementFor(
  level: PerformanceLevel,
  period: Period,
  /** The motivators this administration adopted. Null means "not yet chosen",
   *  in which case the recommended set is assumed. */
  adopted: string[] | null,
): Entitlement {
  const allowed = new Set(adopted ?? RECOMMENDED_KEYS);
  const motivators = qualifyingMotivators(level, period).filter((k) => allowed.has(k));

  return {
    level,
    period,
    actions: actionsFor(level, period),
    certificateClass: certificateClassFor(level),
    motivators,
    disciplinary: ['Very Poor', 'Poor', 'Fair'].includes(level),
  };
}

/** The document's own vocabulary, from the performance classification scheme. */
export function levelFromPercentage(pct: number): PerformanceLevel {
  if (pct >= 91) return 'Very Outstanding';
  if (pct >= 81) return 'Excellent';
  if (pct >= 66) return 'Very Good';
  if (pct >= 50) return 'Good';
  if (pct >= 41) return 'Fair';
  if (pct >= 21) return 'Poor';
  return 'Very Poor';
}
