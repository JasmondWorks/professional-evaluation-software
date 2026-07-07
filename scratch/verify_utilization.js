// Verification script: Test computeH against textbook Case 8.1
// Run with: npx ts-node --skip-project scratch/verify_utilization.ts

// Inline the functions to avoid module resolution issues
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
  const term2Num = lbarPlusTerm * lbarPlusTerm;
  const term2Den = mu * oneMinusInvS2 * A * (K + 1);
  if (term2Den === 0 || !isFinite(term2Den)) return NaN;
  const term2 = term2Num / term2Den;
  const term3 = invS2 / (K + 1);

  return 1 - term2 - term3;
}

// === CASE 8.1 DATA (Dana Nigeria Ltd) ===
const lambda = 1.847;  // avg arrival rate (Eq. 8.26)
const mu = 6.5834;     // avg service rate (Eq. 8.25)
const A = 8;           // 8-hour working day
const rho = lambda / mu;

console.log("=== VERIFICATION: Case 8.1 (Dana Nigeria Ltd) ===");
console.log(`λ = ${lambda}, μ = ${mu}, A = ${A}`);
console.log(`ρ = λ/μ = ${rho.toFixed(6)}`);
console.log(`λ < μ? ${lambda < mu ? "YES ✅" : "NO ❌"}`);
console.log("");

// Print H(K) for K = 1 to 20
console.log("K\t| H(K)\t\t| P₀\t\t| L̄");
console.log("-".repeat(60));

let bestK = 1;
let bestH = -Infinity;

for (let K = 1; K <= 20; K++) {
  const h = computeH(K, A, lambda, mu);
  const s2 = computeS2(K, rho);
  const p0 = 1 / s2;
  const lbar = computeS1(K, rho) / s2;
  
  if (h > bestH) {
    bestH = h;
    bestK = K;
  }
  
  console.log(
    `${K}\t| ${h.toFixed(6)}\t| ${p0.toFixed(6)}\t| ${lbar.toFixed(6)}`
  );
}

console.log("");
console.log(`=== RESULT: K* = ${bestK}, H* = ${bestH.toFixed(6)} ===`);
console.log("");

// Verify key properties
console.log("=== PROPERTY CHECKS ===");

// H should be strictly concave (increases then decreases)
let concaveOk = true;
let foundPeak = false;
for (let K = 2; K <= 20; K++) {
  const hPrev = computeH(K - 1, A, lambda, mu);
  const hCurr = computeH(K, A, lambda, mu);
  if (hCurr < hPrev) {
    if (!foundPeak) {
      foundPeak = true;
      console.log(`Peak found: H starts decreasing at K = ${K}`);
    }
  } else if (foundPeak) {
    // H increased after peak => not strictly concave
    concaveOk = false;
    console.log(`❌ NOT concave: H increased at K = ${K} after peak`);
  }
}
console.log(`Strictly concave? ${concaveOk ? "YES ✅" : "NO ❌"}`);

// H* should be close to 1 (high utilisation)
console.log(`H* close to 1? ${bestH > 0.5 ? "YES ✅" : "POSSIBLY LOW ⚠️"} (H* = ${bestH.toFixed(6)})`);

// All H values should be <= 1
let allBounded = true;
for (let K = 1; K <= 20; K++) {
  const h = computeH(K, A, lambda, mu);
  if (h > 1.0001) {
    allBounded = false;
    console.log(`❌ H(${K}) = ${h} > 1`);
  }
}
console.log(`All H ≤ 1? ${allBounded ? "YES ✅" : "NO ❌"}`);
