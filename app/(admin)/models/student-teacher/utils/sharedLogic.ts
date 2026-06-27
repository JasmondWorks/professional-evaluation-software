// Teaching-Learning Man-Hours Utilisation Function
// Based on Charles-Owaba (Chapter 10)
//
// Formulas implemented:
//   P_0  (Eq 10.14)  — Probability of no student in system
//   W    (Eq 10.13)  — Expected student waiting time
//   H    (Eq 10.15)  — Utilisation function (Ordinary & Robust)
//
// Key derived quantities:
//   F = D - y*a              (Eq 10.8)  — Non-formal hours
//   B = t_1 * F              (Eq 10.9)  — Consultation hours
//   C = [1-(t_1+t_2)] * F    (Eq 10.11) — Assessment hours
//   S_0 = J/(G-D)            (Step 6)   — Research probability (computed)
//         where J = [(1-P_0)*G + D]

export function factorial(n: number): number {
  if (n < 0) return NaN;
  return n <= 1 ? 1 : n * factorial(n - 1);
}

// C(n, k) = n! / (k! * (n-k)!)  — binomial coefficient "n choose k"
export function combination(n: number, k: number): number {
  if (k < 0 || n < 0 || k > n) return NaN;
  return factorial(n) / (factorial(k) * factorial(n - k));
}

/**
 * P_0: Probability of no student in consultation system (Equation 10.14)
 *
 *              [     K                              ] ^{-1}
 *    P_0  =    [ 1 + SUM  C(K,n) * n! * (lam/mu)^n ]
 *              [    n=1                              ]
 *
 * Uses recursive term: A_n = A_{n-1} * (K - n + 1) * rho
 * to avoid factorial overflow for large K.
 */
export const calculateP0 = (k: number, rho: number): number => {
  let sum = 1; // the "1" in [1 + SUM...]
  let term = 1; // A_0 = 1 (seed for recursion)
  for (let n = 1; n <= k; n++) {
    // A_n = A_{n-1} * (K - n + 1) * rho
    // This equals C(K,n) * n! * rho^n
    term *= (k - n + 1) * rho;
    if (!isFinite(term)) return 0; // Overflow → P_0 effectively 0
    sum += term;
  }
  return 1 / sum;
};

/**
 * W: Expected student waiting time (Equation 10.13)
 *
 *          K
 *         SUM  (n-1) * C(K,n) * n! * (lambda/mu)^n * P_0
 *         n=2
 *    W  = ─────────────────────────────────────────────────  +  1/mu
 *                        mu * (1 - P_0)
 *
 * Uses same recursive term approach as calculateP0.
 * Note: loop starts at n=2 because (n-1)=0 when n=1.
 */
export const calculateW = (k: number, lambda: number, mu: number, P0: number): number => {
  if (P0 <= 0 || P0 >= 1) return 1 / mu;

  const rho = lambda / mu;
  let wSum = 0;
  let term = 1; // A_0 = 1 (seed)
  for (let n = 1; n <= k; n++) {
    term *= (k - n + 1) * rho;
    if (!isFinite(term)) break;
    if (n >= 2) {
      wSum += (n - 1) * term * P0;
    }
  }
  return (1 / mu) + (wSum / (mu * (1 - P0)));
};

/**
 * H: Teaching-Learning Man-Hours Utilisation Function
 *
 * Model 1 — Ordinary (Eq 10.15):
 *   H = [K(B-W) + B(1-P_0) + t_4*K] / [B(K+1) + C]
 *
 * Model 2 — Robust:
 *   H = [K(B-W) + B(1-P_0) + t_4*K + (1-S_0)(G-D)] / [B(K+1) + C + (G-D)]
 *   where S_0 = J/(G-D), J = [(1-P_0)*G + D]  (computed, NOT user-supplied)
 */
export const calculateH = (
  K: number,
  mu: number,
  lambda: number,
  params: {
    D: number;
    G: number;
    Y: number;
    alpha: number;
    t1: number;
    t2: number;
    t3: number;
    t4: number;
  }
): { H_ordinary: number; H_robust: number } => {
  const { D, G, Y, alpha, t1, t2, t3, t4 } = params;

  // Guard: mu must be positive to avoid division by zero
  if (mu <= 0) return { H_ordinary: 0, H_robust: 0 };

  // Stability condition: lambda < K * mu  (Important Notes, point 2)
  if (lambda >= K * mu) return { H_ordinary: 0, H_robust: 0 };

  // Step 1: F — non-formal hours (Eq 10.8)
  const F = D - Y * alpha;

  // Step 2: B — consultation hours (Eq 10.9)
  const B = t1 * F;

  // Step 3: C — assessment hours (Eq 10.11)
  const C = (1 - t1 - t2) * F;

  const rho = lambda / mu;

  // Step 4: P_0 — probability no student in system (Eq 10.14)
  const P0 = calculateP0(K, rho);

  // If P_0 = 0, system is fully saturated — configuration not efficient
  if (P0 === 0) return { H_ordinary: 0, H_robust: 0 };

  // Step 5: W — expected student waiting time (Eq 10.13)
  const W = calculateW(K, lambda, mu, P0);

  // --- Numerator components ---
  const term1 = K * (B - W);   // T_s: effective students' consulting man-hours (Eq 10.4)
  const term2 = B * (1 - P0);  // T_l: effective lecturers' consultation man-hours (Eq 10.5)
  const term3 = t4 * K;        // T_A: actual assessment man-hours (Eq 10.6)

  // ──────────────────────────────────────────────────────
  // Model 1 — Ordinary (Eq 10.15)
  //   H = [K(B-W) + B(1-P_0) + t_4*K] / [B(K+1) + C]
  // ──────────────────────────────────────────────────────
  const denomOrdinary = B * (K + 1) + C;
  const H_ordinary = denomOrdinary !== 0
    ? (term1 + term2 + term3) / denomOrdinary
    : 0;

  // ──────────────────────────────────────────────────────
  // Model 2 — Robust
  //   Step 6: Compute S_0 = J/(G-D) where J = [(1-P_0)*G + D]
  //   H = [K(B-W) + B(1-P_0) + t_4*K + (1-S_0)(G-D)] / [B(K+1) + C + (G-D)]
  // ──────────────────────────────────────────────────────
  const GminusD = G - D;
  const J_val = (1 - P0) * G + D;
  const S0 = GminusD !== 0 ? J_val / GminusD : 0;
  const term4 = (1 - S0) * GminusD; // Extra hours for robust model

  const denomRobust = B * (K + 1) + C + GminusD;
  const H_robust = denomRobust !== 0
    ? (term1 + term2 + term3 + term4) / denomRobust
    : 0;

  return { H_ordinary, H_robust };
};

export const findOptimalK_ordinary = (mu: number, lambda: number, params: any) => {
  let maxH = 0;
  let optimalK = 0;
  for (let K = 1; K <= 1000; K++) {
    const { H_ordinary } = calculateH(K, mu, lambda, params);
    if (H_ordinary > maxH) {
      maxH = H_ordinary;
      optimalK = K;
    }
  }
  return { optimalK, maxH };
};

export const findOptimalK_robust = (mu: number, lambda: number, params: any) => {
  let maxH = 0;
  let optimalK = 0;
  for (let K = 1; K <= 1000; K++) {
    const { H_robust } = calculateH(K, mu, lambda, params);
    if (H_robust > maxH) {
      maxH = H_robust;
      optimalK = K;
    }
  }
  return { optimalK, maxH };
};

export const calculateStaffNeeds = (
  optimalKs: number[],
  studentPopulation: number,
  staffMix: { lecturers: number; seniorLecturers: number; professors: number }
) => {
  const [k0, k1, k2, k3, k4] = optimalKs;

  const totalStaffNeeded = k0 > 0 ? Math.round(studentPopulation / k0) : 0;
  const staffDistribution = {
    lecturers: Math.round(totalStaffNeeded * staffMix.lecturers),
    seniorLecturers: Math.round(totalStaffNeeded * staffMix.seniorLecturers),
    professors: Math.round(totalStaffNeeded * staffMix.professors),
  };
  const supervisoryStaff = k1 > 0 ? Math.round(totalStaffNeeded / k1) : 0;
  const managementStaffLevel1 = k2 > 0 ? Math.round(supervisoryStaff / k2) : 0;
  const managementStaffLevel2 = k3 > 0 ? Math.round(managementStaffLevel1 / k3) : 0;
  const topManagementStaff = k4 > 0 ? Math.round(managementStaffLevel2 / k4) : 0;

  return {
    totalStaffNeeded,
    supervisoryStaff,
    managementStaffLevel1,
    managementStaffLevel2,
    topManagementStaff,
    staffDistribution,
  };
};
