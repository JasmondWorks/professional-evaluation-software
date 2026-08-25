// Data integrity test.
//
// The client asked for the check that already existed on the assessment page to
// be available inside the models themselves. The method is unchanged — Tukey's
// fence on the per-staff total, 1.5 x IQR either side of the quartiles — but the
// scope is different in two ways:
//
//   1. It is per model. Running it from the appraisal model tests appraisal
//      submissions only; running it from the performance model tests performance
//      submissions only. The assessment page pooled the two, which made an
//      appraisal outlier look like a performance problem.
//   2. It covers every department in the organization in one run, rather than one
//      department at a time.
//
// A department needs a reasonable number of submissions before a quartile means
// anything, so anything smaller is reported as untested rather than as a pass.

/** Below this many scored submissions a department's quartiles are noise. */
export const MIN_SUBMISSIONS = 15;

export type IntegritySubject = {
  name: string;
  dept: string | null;
  /** The staff member's total across everything they were scored on. */
  score: number;
};

export type IntegrityOutlier = { name: string; score: number };

export type DepartmentIntegrity = {
  dept: string;
  submissions: number;
  status: 'passed' | 'outliers' | 'not_enough';
  outliers: IntegrityOutlier[];
  /** The tolerance band, present only when the department was actually tested. */
  lower: number | null;
  upper: number | null;
};

export type IntegrityReport = {
  model: 'appraisal' | 'performance';
  periodId: number;
  ranAt: string;
  minSubmissions: number;
  departments: DepartmentIntegrity[];
  totals: {
    submissions: number;
    departments: number;
    tested: number;
    passed: number;
    withOutliers: number;
    notEnough: number;
    outliers: number;
  };
  /** True when every department that could be tested came back clean. */
  passed: boolean;
};

const UNASSIGNED = 'Unassigned';

/** Tukey's fence over one department's totals. */
function testDepartment(dept: string, subjects: IntegritySubject[]): DepartmentIntegrity {
  const submissions = subjects.length;
  if (submissions < MIN_SUBMISSIONS) {
    return { dept, submissions, status: 'not_enough', outliers: [], lower: null, upper: null };
  }

  const sorted = subjects.map((s) => s.score).sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length / 4)];
  const q3 = sorted[Math.floor((3 * sorted.length) / 4)];
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;

  const outliers = subjects
    .filter((s) => s.score < lower || s.score > upper)
    .sort((a, b) => a.score - b.score)
    .map((s) => ({ name: s.name, score: s.score }));

  return {
    dept,
    submissions,
    status: outliers.length > 0 ? 'outliers' : 'passed',
    outliers,
    lower,
    upper,
  };
}

/** Run the test over every department represented in `subjects`. */
export function runIntegrityTest(
  model: 'appraisal' | 'performance',
  periodId: number,
  subjects: IntegritySubject[],
): IntegrityReport {
  const byDept = new Map<string, IntegritySubject[]>();
  for (const s of subjects) {
    const dept = s.dept?.trim() || UNASSIGNED;
    const list = byDept.get(dept);
    if (list) list.push(s);
    else byDept.set(dept, [s]);
  }

  const departments = [...byDept.entries()]
    .map(([dept, list]) => testDepartment(dept, list))
    .sort((a, b) => a.dept.localeCompare(b.dept));

  const tested = departments.filter((d) => d.status !== 'not_enough').length;
  const withOutliers = departments.filter((d) => d.status === 'outliers').length;

  return {
    model,
    periodId,
    ranAt: new Date().toISOString(),
    minSubmissions: MIN_SUBMISSIONS,
    departments,
    totals: {
      submissions: subjects.length,
      departments: departments.length,
      tested,
      passed: departments.filter((d) => d.status === 'passed').length,
      withOutliers,
      notEnough: departments.filter((d) => d.status === 'not_enough').length,
      outliers: departments.reduce((n, d) => n + d.outliers.length, 0),
    },
    // Untested departments are not failures — there is simply nothing to say
    // about them yet.
    passed: withOutliers === 0,
  };
}
