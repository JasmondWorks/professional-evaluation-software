// lib/orgModels.ts
// Pure TypeScript implementations for models 11-16.
// Assumptions and simplifications are documented in JSDoc comments.

export type HParams = {
  K: number;      // candidate K (integer)
  B: number;      // average weekly formal lecture hours (or equivalent workload metric)
  W: number;      // workload offset (or lost time)
  P0: number;     // proportion parameter (0..1)
  t1?: number;    // weights (default 1)
  t2?: number;
  t3?: number;
  t4?: number;
  S0?: number;    // proportion (0..1)
  G?: number;     // weekly private hours / total available outside formal hours
  D?: number;     // some duty/time parameter
  Y?: number;     // parameter used with alpha in denom (optional)
  alpha?: number; // parameter used with Y in denom (optional)
};

/** Type that may include extra PDF constraint parameters */
export type HParamsWithConstraints = HParams & {
  lambda?: number;
  mu?: number;
  J?: number;
};

/** PDF-style constraints checker
 * returns true if K is admissible given params; missing params => constraint skipped (treated as satisfied)
 *
 * Interpreted inequalities:
 *  eq39:  t4 * K <= t3 * (D - Y * alpha)
 *  eq40:  W <= t3 * (D - Y * alpha)
 *  eq41:  lambda <= mu
 *  eq42:  J <= (G - D)
 */

export function pdfConstraintsOk(K: number, p: HParamsWithConstraints): boolean {
  const { t3 = 1, t4 = 0, D = 0, Y, alpha, W, lambda, mu, J, G } = p as any;

  // eq39
  if (typeof t4 === "number" && typeof t3 === "number") {
    if (typeof Y === "number" && typeof alpha === "number") {
      const lhs39 = t4 * K;
      const rhs39 = t3 * (D - Y * alpha);
      if (!(lhs39 <= rhs39)) return false;
    } else {
      // fallback: compare t4*K <= t3*D
      const lhs39 = t4 * K;
      const rhs39 = t3 * D;
      if (!(lhs39 <= rhs39)) return false;
    }
  }

  // eq40
  if (typeof W === "number" && typeof t3 === "number") {
    if (typeof Y === "number" && typeof alpha === "number") {
      if (!(W <= t3 * (D - Y * alpha))) return false;
    } else {
      if (!(W <= t3 * D)) return false;
    }
  }

  // eq41: lambda <= mu
  if (typeof lambda === "number" && typeof mu === "number") {
    if (!(lambda <= mu)) return false;
  }

  // eq42: J <= (G - D)
  if (typeof J === "number" && typeof G === "number") {
    if (!(J <= (G - D))) return false;
  }

  return true;
}


/**
 * computeH - computes a scalar utilization H(t,K) following the numerator/denominator
 * pattern used in eq.37 in the PDF.
 *
 * NOTE: The PDF uses terms like K(B-W), B(1-P0)+t4K, (1-S0)G - D in the numerator and
 * denominator terms like K*(D - Y*alpha) + t3*(D - Y*alpha) + (G - D).
 *
 * If Y/alpha are not provided, denominator uses D (and G-D).
 */
export function computeH(params: HParams): number {
  const {
    K,
    B,
    W,
    P0,
    t1 = 1,
    t2 = 1,
    t3 = 1,
    t4 = 0,
    S0 = 0,
    G = 0,
    D = 0,
    Y,
    alpha,
  } = params;

  // numerator terms per PDF summary:
  const termA = K * (B - W);                  // K(B - W)
  const termB = B * (1 - P0) + t4 * K;        // B(1 - P0) + t4*K
  const termC = (1 - S0) * G - D;             // (1 - S0)G - D
  const numerator = t1 * termA + t2 * termB + termC;

  // denominator: prefer (D - Y * alpha) if Y & alpha present
  let denomBase: number;
  if (typeof Y === "number" && typeof alpha === "number") {
    denomBase = D - Y * alpha;
  } else {
    denomBase = D; // fallback if Y/alpha absent
  }
  const denominator = K * denomBase + t3 * denomBase + (G - D);

  if (!isFinite(numerator) || !isFinite(denominator) || denominator === 0) return NaN;

  return numerator / denominator;
}

/**
 * findOptimalK - discrete search for K* over integer range [kmin, kmax].
 * Optionally accept a constraint-check callback that returns true for admissible K.
 */
export function findOptimalK(
  baseParams: Omit<HParams, "K">,
  kmin = 1,
  kmax = 200,
  constraintFn?: (K: number, params: HParams) => boolean
): { Kstar: number; Hstar: number; table: { K: number; H: number; admissible: boolean }[] } {
  let bestK = kmin;
  let bestH = -Infinity;
  const table: { K: number; H: number; admissible: boolean }[] = [];

  for (let K = Math.max(1, Math.floor(kmin)); K <= Math.max(kmin, Math.floor(kmax)); K++) {
    const p: HParams = { ...baseParams, K };
    const h = computeH(p);
    const admissible = typeof constraintFn === "function" ? !!constraintFn(K, p) : true;
    table.push({ K, H: Number.isFinite(h) ? h : NaN, admissible });

    if (admissible && Number.isFinite(h) && h > bestH) {
      bestH = h;
      bestK = K;
    }
  }

  return { Kstar: bestK, Hstar: bestH, table };
}

/* ----------------------
   Model 14: Unit head overloading
   ---------------------- */

/** UnitHeadWorkload describes observed and expected workloads */
export type UnitHeadWorkload = {
  observedCases: number;       // number of cases/tasks observed
  observedHours: number;       // total hours spent by head on tasks in observation period
  expectedHours?: number;      // expected/standard hours for those cases (if known)
  availableHours: number;      // scheduled hours for the head in same period
  complexityFactor?: number;   // optional multiplier for complexity (>1 increases load)
};

/**
 * calcUnitHeadOverload - returns overload metrics:
 * - overloadRatio = actualLoad / capacity
 * - overloaded boolean if ratio > 1
 * - severity: ratio - 1 (positive => magnitude of overload)
 */
export function calcUnitHeadOverload(w: UnitHeadWorkload) {
  const complexity = w.complexityFactor ?? 1;
  // define actual productive load as observedHours * complexity
  const actualLoad = w.observedHours * complexity;

  // define capacity: use expectedHours if provided, otherwise availableHours
  const capacity = w.expectedHours ?? w.availableHours;

  const overloadRatio = capacity === 0 ? NaN : actualLoad / capacity;
  const overloaded = typeof overloadRatio === "number" && overloadRatio > 1;
  const severity = typeof overloadRatio === "number" ? overloadRatio - 1 : NaN;

  return {
    actualLoad,
    capacity,
    overloadRatio,
    overloaded,
    severity,
  };
}

/* ----------------------
   Model 15: Boss lost man-hours due to under-loading
   ---------------------- */

/** BossLoadRecord describes scheduled vs productive time */
export type BossLoadRecord = {
  scheduledHours: number;        // total scheduled hours in period (e.g., week)
  productiveHours: number;       // hours spent on high-value productive tasks
  allowableNonProductive?: number; // allowance (breaks, training) in hours
};

/**
 * calcLostManHoursUnderload - under-loading lost hours = max(0, productive deficit)
 * where deficit = scheduledHours - (productiveHours + allowableNonProductive)
 */
export function calcLostManHoursUnderload(rec: BossLoadRecord) {
  const allowance = rec.allowableNonProductive ?? 0;
  const productiveAvailable = rec.productiveHours + allowance;
  const deficit = rec.scheduledHours - productiveAvailable;
  const lostHours = Math.max(0, deficit);

  // percentage of scheduled hours lost
  const lostPercent = rec.scheduledHours === 0 ? NaN : (lostHours / rec.scheduledHours) * 100;

  return {
    scheduledHours: rec.scheduledHours,
    productiveHours: rec.productiveHours,
    allowance,
    lostHours,
    lostPercent,
  };
}

/* ----------------------
   Model 16: Total wasted man-hour cost
   ---------------------- */

/** RoleLostHours maps role name to lost hours in period (e.g., per week / month) */
export type RoleLostHours = { [role: string]: number };

/** RoleRates maps role name to hourly cost (direct pay). overheadMultiplier multiplies direct pay to include employer overheads (taxes, benefits). */
export function calcWastedManHourCost(
  lost: RoleLostHours,
  hourlyRates: { [role: string]: number },
  overheadMultiplier = 1.0
) {
  let totalCost = 0;
  const perRole: { role: string; hours: number; rate: number; cost: number }[] = [];

  for (const role of Object.keys(lost)) {
    const hours = lost[role] || 0;
    const rate = hourlyRates[role] ?? 0;
    const cost = hours * rate * overheadMultiplier;
    perRole.push({ role, hours, rate, cost });
    totalCost += cost;
  }

  return {
    perRole,
    totalCost,
  };
}

/* ----------------------
  Helper: compute supervisors at a level (Model 17)
  ---------------------- */

/**
 * calcSupervisoryLevelSize
 * - totalSubordinates: total number of employees at the level below
 * - Kstar: optimal span (K*)
 * returns number of supervisors required (ceil)
 */
export function calcSupervisoryLevelSize(totalSubordinates: number, Kstar: number) {
  if (Kstar <= 0) return NaN;
  return Math.ceil(totalSubordinates / Kstar);
}
