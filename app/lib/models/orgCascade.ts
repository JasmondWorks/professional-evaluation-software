// The management-level cascade behind sections 17–19 of the organization
// structure model.
//
// The client's rule, in their words: divide the staff number by K* to get the
// number of managers at level 1; that count becomes the numerator at level 2,
// where a fresh λ and μ give a fresh K* to divide by; and so on until the count
// reaches 1, which is the top of the organization. The number of levels that
// took is the shape of the structure.
//
// Kept out of the page because it is the part with the arithmetic in it, and
// because section 19 and section 21 both read the same ladder.

import {
  findOptimalK,
  findOptimalKCost,
} from '@/app/(admin)/models/personnel-utilization/lib/util-models11-16';

export type CascadeLevel = {
  /** 1 for the first management level above the supervisory staff. */
  level: number;
  /** What is being divided at this level: the head count carried up from below. */
  numerator: number;
  lambda: number;
  mu: number;
  /** A — the attendance/availability constant the utilization model takes. */
  A: number;
  /** The optimal span of control for this level, from the utilization model. */
  kstar: number;
  /** numerator / kstar — the managers needed at this level. */
  count: number;
};

/** Cost-side rates. The redundancy model walks the same ladder as the
 *  organization structure, but its K* comes from minimising the supervision
 *  cost D (Eq. 8.35) instead of maximising utilization H — the client's only
 *  stated difference between the two pages. */
export type CostLevelRates = { lambda: number; mu: number; A: number; a: number; b: number };

export type CascadeInput = {
  /** Staff number from whichever estimation method was used. */
  staffNumber: number;
  /** K* for the supervisory level, from personnel utilization. */
  supervisoryKstar: number;
  /** One λ/μ pair per management level above the first. */
  levels: { lambda: number; mu: number; A: number }[];
};

export type CascadeResult = {
  levels: CascadeLevel[];
  /** n — the number of management levels, which fills the denominator of
   *  section 19 (shape of structure). */
  n: number;
  /** True when the ladder reached a single post at the top, as it should. */
  reachedTop: boolean;
  /** Why the cascade stopped early, if it did. */
  note?: string;
};

/** A count of people is a whole number of people. Rounding up rather than to
 *  nearest: half a manager short of the span still needs a manager. */
function headcount(value: number): number {
  return Math.max(1, Math.ceil(value));
}

/** Walk the ladder from the supervisory staff up to the single post at the top.
 *
 *  `levels` supplies the rates for each step. The walk stops when the count
 *  reaches 1, or when it runs out of supplied rates — the caller then knows to
 *  ask for another λ/μ pair. */
export function runCascade(
  input: CascadeInput,
  /** How a level turns its rates into a span. Defaults to the utilization
   *  optimum; the redundancy model passes the cost optimum instead. */
  solve: (
    level: { lambda: number; mu: number; A: number },
    index: number,
  ) => number = (l) => findOptimalK({ A: l.A, lambda: l.lambda, mu: l.mu }).Kstar,
): CascadeResult {
  const { staffNumber, supervisoryKstar, levels } = input;

  if (!(staffNumber > 0) || !(supervisoryKstar > 0)) {
    return { levels: [], n: 0, reachedTop: false, note: 'A staff number and a supervisory K* are both needed.' };
  }

  const out: CascadeLevel[] = [];

  // Level 1 divides the staff number by the supervisory K*. It is the only
  // level whose K* comes from an earlier run rather than from rates entered
  // here, which is why it is outside the loop.
  let count = headcount(staffNumber / supervisoryKstar);
  out.push({
    level: 1,
    numerator: staffNumber,
    lambda: NaN,
    mu: NaN,
    A: NaN,
    kstar: supervisoryKstar,
    count,
  });

  for (let i = 0; i < levels.length; i++) {
    if (count <= 1) break;

    const { lambda, mu, A } = levels[i];
    // The same stability rule as everywhere else: without λ < μ the utilization
    // model has no optimum to return.
    if (!(lambda > 0) || !(mu > 0) || !(lambda < mu)) {
      return {
        levels: out,
        n: out.length,
        reachedTop: false,
        note: `Level ${out.length + 1} needs λ and μ with λ strictly less than μ.`,
      };
    }

    const Kstar = solve({ A, lambda, mu }, i);
    if (!(Kstar > 0)) {
      return {
        levels: out,
        n: out.length,
        reachedTop: false,
        note: `Level ${out.length + 1} produced no optimal K from those rates.`,
      };
    }

    const numerator = count;
    count = headcount(numerator / Kstar);
    out.push({
      level: out.length + 1,
      numerator,
      lambda,
      mu,
      A,
      kstar: Kstar,
      count,
    });

    // A level whose span does not actually reduce the head count would repeat
    // forever; stop and say so rather than spin.
    if (count >= numerator) {
      return {
        levels: out,
        n: out.length,
        reachedTop: false,
        note: `Level ${out.length} does not reduce the head count (K* = ${Kstar}). Raise μ relative to λ so the span of control widens.`,
      };
    }
  }

  const reachedTop = count <= 1;
  return {
    levels: out,
    n: out.length,
    reachedTop,
    note: reachedTop ? undefined : 'Add another management level to carry the cascade up to a single post.',
  };
}

/** Section 21. The ideal head count for a level is what the cascade produced;
 *  the real one is what the organization actually employs there. */
export function percentageRedundancy(ideal: number, real: number): number | null {
  if (!(real > 0)) return null;
  return ((real - ideal) / real) * 100;
}

/** The organization's personnel redundancy: the surplus across every level
 *  taken against the total actually employed, rather than the mean of the
 *  per-level percentages — levels differ wildly in size, and averaging the
 *  percentages would let a two-post top level outvote the shop floor. */
export function personnelRedundancy(
  rows: { ideal: number; real: number }[],
): number | null {
  const totalReal = rows.reduce((s, r) => s + (r.real || 0), 0);
  if (!(totalReal > 0)) return null;
  const totalIdeal = rows.reduce((s, r) => s + (r.ideal || 0), 0);
  return ((totalReal - totalIdeal) / totalReal) * 100;
}


/** The same ladder, driven by the supervision cost optimum: K* is the span that
 *  minimises D (Eq. 8.35) rather than the one that maximises H. The client's
 *  only stated difference between this page and the organization structure. */
export function runCostCascade(input: {
  staffNumber: number;
  supervisoryKstar: number;
  levels: CostLevelRates[];
}): CascadeResult {
  return runCascade(
    {
      staffNumber: input.staffNumber,
      supervisoryKstar: input.supervisoryKstar,
      levels: input.levels.map((l) => ({ lambda: l.lambda, mu: l.mu, A: l.A })),
    },
    (_l, i) => {
      const { A, a, b, lambda, mu } = input.levels[i];
      return findOptimalKCost({ A, a, b, lambda, mu }).Kstar;
    },
  );
}
