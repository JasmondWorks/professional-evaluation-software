// lib/util-models11-16.ts
// Pure TypeScript implementations for Personnel Utilisation models.
// Based on Charles-Owaba, Design Criteria and Problem Definition, Ch. 8.
//
// Model 11: Personnel Utilisation Function H_ij (Master Formula, Eq. 8.8b)
// Model 14: Unit Head Overloading
// Model 15: Boss lost man-hours due to under-loading
// Model 16: Total wasted man-hour cost
// Model 17: Supervisory level size

// ===================================================================
// MODEL 11 — Personnel Utilisation (Eq. 8.8b)
// ===================================================================

/**
 * Parameters for the Personnel Utilisation function H_ij.
 *
 * The ONLY variable is K (span of control).
 * Everything else is a parameter estimated from steady-state data.
 *
 * Eq. (8.10): Θ_ij = { A_ij, λ_ij, μ_ij }
 */
export type HParams = {
  A: number;       // A_ij — hours scheduled for work in a day
  lambda: number;  // λ_ij — arrival rate (cases/hour consulting boss)
  mu: number;      // μ_ij — service rate (cases/hour boss processes)
};

/**
 * Binomial coefficient C(n, k) = n! / (k! * (n-k)!)
 * Uses multiplicative formula to avoid huge intermediate factorials.
 */
export function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  // Take advantage of symmetry: C(n,k) = C(n, n-k)
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

/**
 * Factorial of n. For use with moderate n (n <= ~170 for doubles).
 */
export function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Compute S2 (Eq. 8.6 denominator / Eq. 8.8b helper):
 *
 *   S2 = 1 + Σ_{n=1}^{K} C(K, n) * n! * ρ^n
 *
 * where ρ = λ/μ
 */
export function computeS2(K: number, rho: number): number {
  let sum = 1; // the leading 1
  for (let n = 1; n <= K; n++) {
    sum += binomial(K, n) * factorial(n) * Math.pow(rho, n);
  }
  return sum;
}

/**
 * Compute S1 (Eq. 8.7 numerator / Eq. 8.8b helper):
 *
 *   S1 = Σ_{n=2}^{K} (n-1) * C(K, n) * n! * ρ^n
 */
export function computeS1(K: number, rho: number): number {
  let sum = 0;
  for (let n = 2; n <= K; n++) {
    sum += (n - 1) * binomial(K, n) * factorial(n) * Math.pow(rho, n);
  }
  return sum;
}

/**
 * Compute P_ij (Eq. 8.6) — probability that the boss has no case to attend to.
 *
 *   P_ij = 1 / S2
 */
export function computeP0(K: number, rho: number): number {
  const s2 = computeS2(K, rho);
  if (s2 === 0) return NaN;
  return 1 / s2;
}

/**
 * Compute L̄_ij (Eq. 8.7) — average number of cases that waited in a day.
 *
 *   L̄_ij = S1 / S2
 */
export function computeLbar(K: number, rho: number): number {
  const s1 = computeS1(K, rho);
  const s2 = computeS2(K, rho);
  if (s2 === 0) return NaN;
  return s1 / s2;
}

/**
 * Compute H_ij — the Master Design Formula (Eq. 8.8b).
 *
 * H_ij(K, A, μ, λ) =
 *   1
 *   - { [(S1/S2 + 1 - 1/S2)^2] / [μ * (1 - 1/S2) * A * (K + 1)] }
 *   - [ (1/S2) / (K + 1) ]
 *
 * Constraint (Eq. 8.9): λ < μ  (i.e. ρ < 1)
 *
 * @param K   - span of control (integer ≥ 1)
 * @param A   - hours scheduled for work in a day
 * @param lambda - arrival rate (cases/hour)
 * @param mu  - service rate (cases/hour)
 * @returns H_ij value (should be between 0 and 1)
 */
export function computeH(K: number, A: number, lambda: number, mu: number): number {
  if (K < 1 || A <= 0 || mu <= 0 || lambda <= 0) return NaN;
  if (lambda >= mu) return NaN; // violates Eq. 8.9

  const rho = lambda / mu;
  const s1 = computeS1(K, rho);
  const s2 = computeS2(K, rho);

  if (s2 === 0 || !isFinite(s2)) return NaN;

  const invS2 = 1 / s2;           // 1/S2  = P_ij (Eq. 8.6)
  const lbar = s1 / s2;           // L̄_ij  (Eq. 8.7)
  const oneMinusInvS2 = 1 - invS2; // (1 - P_ij)

  if (oneMinusInvS2 === 0) return NaN; // degenerate: boss always idle

  // Eq. 8.5 intermediate: (L̄ + 1 - P_ij)
  const lbarPlusTerm = lbar + 1 - invS2;

  // Second term of H_ij:
  // { (L̄ + 1 - P_ij)^2 } / { μ * (1 - P_ij) * A * (K + 1) }
  const term2Num = lbarPlusTerm * lbarPlusTerm;
  const term2Den = mu * oneMinusInvS2 * A * (K + 1);
  if (term2Den === 0 || !isFinite(term2Den)) return NaN;
  const term2 = term2Num / term2Den;

  // Third term of H_ij:
  // P_ij / (K + 1)
  const term3 = invS2 / (K + 1);

  const H = 1 - term2 - term3;

  if (!isFinite(H)) return NaN;
  return H;
}

/**
 * Result of the optimal K search, including all intermediate computed values
 * for the optimal K*.
 */
export type OptimalKResult = {
  Kstar: number;
  Hstar: number;
  rho: number;
  P0: number;       // P_ij at K*
  Lbar: number;     // L̄_ij at K*
  table: { K: number; H: number }[];
};

/**
 * findOptimalK — automatic discrete search for K*
 * that maximises H_ij.
 *
 * H_ij is a strictly concave single-variable function of K_ij
 * (Gottfried and Weisman, 1973), so the global maximum is unique.
 * We stop searching after observing 5 consecutive decreasing values
 * to capture a nice curve for the chart.
 *
 * @param params  - { A, lambda, mu }
 * @param maxIterations - safety limit (default 100)
 */
export function findOptimalK(
  params: HParams,
  maxIterations = 100
): OptimalKResult {
  const { A, lambda, mu } = params;
  const rho = lambda / mu;

  let bestK = 1;
  let bestH = -Infinity;
  const table: { K: number; H: number }[] = [];

  let k = 1;
  let decreasingCount = 0;

  while (k <= maxIterations) {
    const h = computeH(k, A, lambda, mu);
    table.push({ K: k, H: Number.isFinite(h) ? h : NaN });

    if (Number.isFinite(h)) {
      if (h > bestH) {
        bestH = h;
        bestK = k;
        decreasingCount = 0;
      } else {
        decreasingCount++;
      }
    } else {
      decreasingCount++;
    }

    if (decreasingCount >= 5) {
      break;
    }
    k++;
  }

  // Compute intermediate values at K*
  const P0 = computeP0(bestK, rho);
  const Lbar = computeLbar(bestK, rho);

  return {
    Kstar: bestK,
    Hstar: bestH,
    rho,
    P0,
    Lbar,
    table,
  };
}


// ===================================================================
// ORGANISATION-WIDE MODELS (Eqs. 8.11–8.20)
// ===================================================================

/**
 * Compute the whole-organisation utilisation H (Eq. 8.11):
 *
 *   H = [ Σ_i Σ_j H_ij ] / [ Σ_i N_i ]
 *
 * @param H_values - 2D array: H_values[i][j] = H_ij at level i, position j
 * @returns organisation-wide H
 */
export function computeOrgH(H_values: number[][]): number {
  let sumH = 0;
  let sumN = 0;
  for (const level of H_values) {
    sumN += level.length;
    for (const h of level) {
      if (Number.isFinite(h)) sumH += h;
    }
  }
  if (sumN === 0) return NaN;
  return sumH / sumN;
}

/**
 * Compute N_i* — optimal number of positions at decision level i (Eq. 8.16):
 *
 *   N_i* = N_0 / Π_{a=1}^{i-1} Q_a*
 *
 * With rounding rule (Eq. 8.20):
 *   - If only a decimal (< 1), round to 1.
 *   - If decimal component >= 0.5, round up.
 *   - If decimal component < 0.5, round down.
 *
 * @param N0     - number of terminal operation positions
 * @param Qstars - array of optimal spans Q_1*, Q_2*, ... Q_M*
 * @returns array of N_i* for i = 1, 2, ..., M
 */
export function computeOptimalLevelSizes(N0: number, Qstars: number[]): number[] {
  const levels: number[] = [];
  let product = 1;

  for (let i = 0; i < Qstars.length; i++) {
    product *= Qstars[i];
    const raw = N0 / product;

    // Rounding rule (Eq. 8.20)
    let rounded: number;
    if (raw < 1) {
      rounded = 1;
    } else {
      const decimal = raw - Math.floor(raw);
      rounded = decimal >= 0.5 ? Math.ceil(raw) : Math.floor(raw);
    }

    levels.push(rounded);
  }

  return levels;
}


// ===================================================================
// MODEL 14: Unit Head Overloading
// ===================================================================

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


// ===================================================================
// MODEL 15: Boss lost man-hours due to under-loading
// ===================================================================

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


// ===================================================================
// MODEL 16: Total wasted man-hour cost
// ===================================================================

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


// ===================================================================
// MODEL 17: Supervisory level size helper
// ===================================================================

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


// ===================================================================
// SUPERVISION COST — Wasted Man-Hours Cost Function (Eq. 8.35)
// (Charles-Owaba, Ch. 8, Section 4)
// ===================================================================

/**
 * Parameters for the Supervision Cost function D_ij.
 *
 * Eq. (8.37): Θ_c = { A_ij, a_ij, b_ij, λ_ij, μ_ij }
 *
 * K_ij is the ONLY variable — everything else is a fixed parameter.
 */
export type DParams = {
  A: number;       // A_ij — hours scheduled for work in a day
  a: number;       // a_ij — unit cost associated with man-hours spent
  b: number;       // b_ij — unit cost per wasted man-hour of the boss
  lambda: number;  // λ_ij — arrival rate (cases/hour consulting boss)
  mu: number;      // μ_ij — service rate (cases/hour boss processes)
};

/**
 * Compute D_ij — the Master Cost Formula (Eq. 8.35).
 *
 * D_ij(K, A, a, b, λ, μ) =
 *   { [(S1/S2 + S2⁻¹)²] / [1 - S2⁻¹] } * (a / μ)
 *   + b * A * S2⁻¹
 *
 * where:
 *   S1 = Σ_{n=2}^{K} (n-1) * C(K,n) * n! * ρ^n
 *   S2 = 1 + Σ_{n=1}^{K} C(K,n) * n! * ρ^n
 *   ρ  = λ / μ   (Eq. 8.36)
 *
 * Constraint (Eq. 8.9): λ < μ  (i.e. ρ < 1)
 *
 * @param K      - span of control (integer ≥ 1)
 * @param A      - hours scheduled for work in a day
 * @param a      - unit cost of man-hours spent (subordinate waiting cost)
 * @param b      - unit cost per wasted man-hour of the boss
 * @param lambda - arrival rate (cases/hour)
 * @param mu     - service rate (cases/hour)
 * @returns D_ij value (cost, should be ≥ 0)
 */
export function computeD(
  K: number, A: number, a: number, b: number,
  lambda: number, mu: number
): number {
  if (K < 1 || A <= 0 || mu <= 0 || lambda <= 0) return NaN;
  if (lambda >= mu) return NaN; // violates Eq. 8.9

  const rho = lambda / mu;
  const s1 = computeS1(K, rho);
  const s2 = computeS2(K, rho);

  if (s2 === 0 || !isFinite(s2)) return NaN;

  const invS2 = 1 / s2;            // S2⁻¹ = P_ij (Eq. 8.6)
  const lbar = s1 / s2;            // L̄_ij   (Eq. 8.7)
  const oneMinusInvS2 = 1 - invS2; // (1 - P_ij)

  if (oneMinusInvS2 === 0) return NaN; // degenerate: boss always idle

  // First term of D_ij (Eq. 8.35):
  // { (L̄ + 1 − P_ij)² / (1 − P_ij) } × (a / μ)
  //
  // NOTE: Eq. 8.35 uses (S1/S2 + S2⁻¹) which is (L̄ + P_ij).
  // But substituting from Eq. 8.33 via (8.3)/(8.4), the numerator
  // squared term is (L̄ + 1 − P_ij)². We follow the textbook Eq. 8.35
  // literally: (S1/S2 + S2⁻¹) = (L̄ + P_ij).
  const lbarPlusPij = lbar + invS2; // S1/S2 + S2⁻¹
  const term1Num = lbarPlusPij * lbarPlusPij;
  const term1Den = oneMinusInvS2;
  if (term1Den === 0 || !isFinite(term1Den)) return NaN;
  const term1 = (term1Num / term1Den) * (a / mu);

  // Second term of D_ij (Eq. 8.35):
  // b * A * S2⁻¹
  const term2 = b * A * invS2;

  const D = term1 + term2;

  if (!isFinite(D)) return NaN;
  return D;
}

/**
 * Result of the optimal K search for the supervision cost function,
 * including all intermediate computed values for K*.
 */
export type OptimalKCostResult = {
  Kstar: number;
  Dstar: number;     // minimum cost
  rho: number;
  P0: number;        // P_ij at K*
  Lbar: number;      // L̄_ij at K*
  table: { K: number; D: number }[];
};

/**
 * findOptimalKCost — automatic discrete search for K*
 * that MINIMISES D_ij (the supervision cost function).
 *
 * D_ij is concave (U-shaped) with respect to K_ij
 * (Gottfried and Weisman, 1973), so the global minimum is unique.
 * We stop searching after observing 5 consecutive increasing values
 * to capture a nice curve for the chart.
 *
 * @param params  - { A, a, b, lambda, mu }
 * @param maxIterations - safety limit (default 100)
 */
export function findOptimalKCost(
  params: DParams,
  maxIterations = 100
): OptimalKCostResult {
  const { A, a, b, lambda, mu } = params;
  const rho = lambda / mu;

  let bestK = 1;
  let bestD = Infinity; // seek minimum
  const table: { K: number; D: number }[] = [];

  let k = 1;
  let increasingCount = 0;

  while (k <= maxIterations) {
    const d = computeD(k, A, a, b, lambda, mu);
    table.push({ K: k, D: Number.isFinite(d) ? d : NaN });

    if (Number.isFinite(d)) {
      if (d < bestD) {
        bestD = d;
        bestK = k;
        increasingCount = 0;
      } else {
        increasingCount++;
      }
    } else {
      increasingCount++;
    }

    if (increasingCount >= 5) {
      break;
    }
    k++;
  }

  // Compute intermediate values at K*
  const P0 = computeP0(bestK, rho);
  const Lbar = computeLbar(bestK, rho);

  return {
    Kstar: bestK,
    Dstar: bestD,
    rho,
    P0,
    Lbar,
    table,
  };
}
