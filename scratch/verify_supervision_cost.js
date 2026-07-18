// Verification script: Test computeD (Supervision Cost, Eq. 8.35)
// against Figure 8.6 example parameter sets from the textbook.
// Run with: node scratch/verify_supervision_cost.js

// Inline the functions (same as util-models11-16.ts)
function binomial(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

function factorial(n) {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function computeS2(K, rho) {
  let sum = 1;
  for (let n = 1; n <= K; n++) {
    sum += binomial(K, n) * factorial(n) * Math.pow(rho, n);
  }
  return sum;
}

function computeS1(K, rho) {
  let sum = 0;
  for (let n = 2; n <= K; n++) {
    sum += (n - 1) * binomial(K, n) * factorial(n) * Math.pow(rho, n);
  }
  return sum;
}

// Master Cost Formula (Eq. 8.35)
function computeD(K, A, a, b, lambda, mu) {
  if (K < 1 || A <= 0 || mu <= 0 || lambda <= 0) return NaN;
  if (lambda >= mu) return NaN;

  const rho = lambda / mu;
  const s1 = computeS1(K, rho);
  const s2 = computeS2(K, rho);

  if (s2 === 0 || !isFinite(s2)) return NaN;

  const invS2 = 1 / s2;
  const lbar = s1 / s2;
  const oneMinusInvS2 = 1 - invS2;

  if (oneMinusInvS2 === 0) return NaN;

  // Eq. 8.35: term1 = [(S1/S2 + S2^-1)^2 / (1 - S2^-1)] * (a / mu)
  const lbarPlusPij = lbar + invS2;
  const term1 = ((lbarPlusPij * lbarPlusPij) / oneMinusInvS2) * (a / mu);

  // Eq. 8.35: term2 = b * A * S2^-1
  const term2 = b * A * invS2;

  return term1 + term2;
}

// === FIGURE 8.6 EXAMPLE PARAMETER SETS ===
// All use delta (a=b) = 50, A = 8
const testSets = [
  { name: "S1", lambda: 1.0,  mu: 10.0, a: 50, b: 50, A: 8 },
  { name: "S2", lambda: 8.5,  mu: 18.5, a: 50, b: 50, A: 8 },
  { name: "S3", lambda: 1.0,  mu: 10.0, a: 50, b: 50, A: 8 }, // same as S1
  { name: "S4", lambda: 1.0,  mu: 10.0, a: 50, b: 50, A: 8 }, // same as S1
  { name: "S5", lambda: 23.5, mu: 27.0, a: 50, b: 50, A: 8 },
];

// Also test with Case 8.1 data (Dana Nigeria Ltd)
const danaCase = { name: "Dana (Case 8.1)", lambda: 1.847, mu: 6.5834, a: 50, b: 50, A: 8 };

console.log("=== VERIFICATION: Supervision Cost (Eq. 8.35) ===\n");

// Run all test sets
[...testSets, danaCase].forEach((set) => {
  if (set.lambda >= set.mu) {
    console.log(`--- ${set.name}: SKIPPED (λ >= μ) ---\n`);
    return;
  }

  const rho = set.lambda / set.mu;
  console.log(`--- ${set.name}: λ=${set.lambda}, μ=${set.mu}, A=${set.A}, a=${set.a}, b=${set.b} ---`);
  console.log(`ρ = ${rho.toFixed(6)}`);
  console.log("");
  console.log("K\t| D(K)\t\t| P₀\t\t| L̄");
  console.log("-".repeat(60));

  let bestK = 1;
  let bestD = Infinity;

  for (let K = 1; K <= 20; K++) {
    const d = computeD(K, set.A, set.a, set.b, set.lambda, set.mu);
    const s2 = computeS2(K, rho);
    const p0 = 1 / s2;
    const lbar = computeS1(K, rho) / s2;

    if (d < bestD) {
      bestD = d;
      bestK = K;
    }

    console.log(
      `${K}\t| ${isFinite(d) ? d.toFixed(4) : "NaN"}\t\t| ${p0.toFixed(6)}\t| ${lbar.toFixed(6)}`
    );
  }

  console.log("");
  console.log(`RESULT: K* = ${bestK}, D* = ${bestD.toFixed(4)}`);
  console.log("");
});

// === PROPERTY CHECKS ===
console.log("=== PROPERTY CHECKS (using Dana Case 8.1 data) ===\n");

const { lambda, mu, a, b, A } = danaCase;

// 1. U-shaped concavity: D should decrease then increase
let foundMin = false;
let concaveOk = true;
for (let K = 2; K <= 20; K++) {
  const dPrev = computeD(K - 1, A, a, b, lambda, mu);
  const dCurr = computeD(K, A, a, b, lambda, mu);
  if (dCurr > dPrev) {
    if (!foundMin) {
      foundMin = true;
      console.log(`Minimum found: D starts increasing at K = ${K}`);
    }
  } else if (foundMin) {
    concaveOk = false;
    console.log(`NOT concave: D decreased at K = ${K} after minimum`);
  }
}
console.log(`U-shaped (concave)? ${concaveOk ? "YES ✅" : "NO ❌"}`);

// 2. All D values should be > 0
let allPositive = true;
for (let K = 1; K <= 20; K++) {
  const d = computeD(K, A, a, b, lambda, mu);
  if (isFinite(d) && d < 0) {
    allPositive = false;
    console.log(`D(${K}) = ${d} < 0`);
  }
}
console.log(`All D > 0? ${allPositive ? "YES ✅" : "NO ❌"}`);

// 3. Compare K* for cost vs utilisation (they should be close but not necessarily identical)
// Use the utilisation H function
function computeH(K, A, lambda, mu) {
  if (K < 1 || A <= 0 || mu <= 0 || lambda <= 0) return NaN;
  if (lambda >= mu) return NaN;
  const rho = lambda / mu;
  const s1 = computeS1(K, rho);
  const s2 = computeS2(K, rho);
  if (s2 === 0 || !isFinite(s2)) return NaN;
  const invS2 = 1 / s2;
  const lbar = s1 / s2;
  const oneMinusInvS2 = 1 - invS2;
  if (oneMinusInvS2 === 0) return NaN;
  const lbarPlusTerm = lbar + 1 - invS2;
  const term2 = (lbarPlusTerm * lbarPlusTerm) / (mu * oneMinusInvS2 * A * (K + 1));
  const term3 = invS2 / (K + 1);
  return 1 - term2 - term3;
}

let bestKH = 1, bestH = -Infinity;
let bestKD = 1, bestDVal = Infinity;
for (let K = 1; K <= 20; K++) {
  const h = computeH(K, A, lambda, mu);
  const d = computeD(K, A, a, b, lambda, mu);
  if (h > bestH) { bestH = h; bestKH = K; }
  if (d < bestDVal) { bestDVal = d; bestKD = K; }
}
console.log(`\nK* (utilisation, max H): ${bestKH} (H* = ${bestH.toFixed(6)})`);
console.log(`K* (cost, min D):        ${bestKD} (D* = ${bestDVal.toFixed(4)})`);
console.log(`Same K*? ${bestKH === bestKD ? "YES ✅" : "Different (expected per Section 4.2)"}`);
