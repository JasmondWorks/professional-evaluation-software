// app/models/student-teacher/utils/calculations.ts

export function factorial(n: number): number {
  if (n < 0) return NaN;
  return n <= 1 ? 1 : n * factorial(n - 1);
}

export function combination(n: number, k: number): number {
  if (k < 0 || n < 0 || k > n) return NaN;
  return factorial(n) / (factorial(k) * factorial(n - k));
}

export const calculateP0 = (k: number, rho: number) => {
  let sum = 1;
  for (let n = 2; n <= k; n++) {
    sum += combination(n, k) * factorial(n) * Math.pow(rho, n);
  }
  return 1 / sum;
};

export const calculateW = (k: number, lambda: number, mu: number, P0: number) => {
  let sum = 0;
  for (let n = 2; n <= k; n++) {
    sum += (n - 1) * combination(n, k) * factorial(n) * Math.pow(lambda / mu, n) * P0;
  }
  return (1 / mu) + (sum / (mu * (1 - P0)));
};

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
    S0: number;
  }
): { H_ordinary: number; H_robust: number } => {
  const { D, G, Y, alpha, t1, t2, t3, t4, S0 } = params;

  const F = D - Y * alpha;
  const B = t1 * F;
  const rho = lambda / mu;
  if (rho >= 1) return { H_ordinary: 0, H_robust: 0 };

  const P0 = calculateP0(K, rho);
  const W = calculateW(K, lambda, mu, P0);

  const term1 = K * (B - W);
  const term2 = B * (1 - P0);
  const term3 = t4 * K;
  const term4 = (1 - S0) * G - D;

  const denom1 = (K + 1) * (D - Y * alpha) * t1;
  const denom2 = (1 - t1 - t2) * (D - Y * alpha);
  const denom3 = G - D;

  const H_robust = (term1 + term2 + term3 + term4) / (denom1 + denom2 + denom3);
  const H_ordinary = (term1 + term2 + term3) / (denom1 + denom2);

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

  const totalStaffNeeded = Math.ceil(studentPopulation / k0);
  const staffDistribution = {
    lecturers: Math.round(totalStaffNeeded * staffMix.lecturers),
    seniorLecturers: Math.round(totalStaffNeeded * staffMix.seniorLecturers),
    professors: Math.round(totalStaffNeeded * staffMix.professors),
  };
  const supervisoryStaff = Math.ceil(totalStaffNeeded / k1);
  const managementStaffLevel1 = Math.ceil(supervisoryStaff / k2);
  const managementStaffLevel2 = Math.ceil(managementStaffLevel1 / k3);
  const topManagementStaff = Math.ceil(managementStaffLevel2 / k4);

  return {
    totalStaffNeeded,
    supervisoryStaff,
    managementStaffLevel1,
    managementStaffLevel2,
    topManagementStaff,
    staffDistribution,
  };
};
