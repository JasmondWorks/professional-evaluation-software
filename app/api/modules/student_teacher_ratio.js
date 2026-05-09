/**
 * Calculate teaching-learning man-hour utilization function H(t, K)
 * @param {Object} params - Configuration parameters
 * @param {number} params.K - Number of students per staff
 * @param {number} params.D - Total official hours available for all lecturers' formal activities per week
 * @param {number} params.Y - Average weekly lecture hours per course
 * @param {number} params.alpha - Number of courses to be lectured per week
 * @param {number} params.t1 - Proportion of non-classroom teacher's time for students' consultation
 * @param {number} params.t2 - Proportion of non-classroom teacher's time meant for research and community service
 * @param {number} params.t3 - Proportion of non-classroom teacher's time for assessment
 * @param {number} params.t4 - Standard hours a lecturer needs to completely assess work done by a single student in one week
 * @param {number} params.G - Total hours available in the week
 * @param {number} params.lambda - Rate at which students consult the lecturer per hour
 * @param {number} params.mu - Rate at which lecturer attends to students per hour
 * @param {number} params.S0 - Probability of having gone into more research work outside formal working hours per week
 * @returns {number} The teaching-learning man-hour utilization value
 */
function calculateUtilizationFunction(params) {
  const { K, D, Y, alpha, t1, t2, t3, t4, G, lambda, mu, S0 } = params;
  
  // Validate that proportions sum to 1
  if (Math.abs((t1 + t2 + t3) - 1) > 0.0001) {
    throw new Error("Proportions t1, t2, and t3 must sum to 1");
  }
  
  // Calculate B - scheduled hours for student consultation
  const B = t1 * (D - Y * alpha);
  
  // Calculate C - hours scheduled for assessing student work
  const C = t3 * (D - Y * alpha);
  
  // Calculate P0 - probability of having no student in the consultation system
  const P0 = calculateP0(K, lambda, mu);
  
  // Calculate W - expected hours a student waits before receiving lecturer's attention
  const W = calculateWaitingTime(K, lambda, mu, P0);
  
  // Numerator components
  const consultationComponent = K * (B - W);
  const assessmentComponent = B * (1 - P0) + t4 * K;
  const researchComponent = (1 - S0) * (G - D);
  
  // Denominator
  const denominator = K * (1 - D) * Y * alpha * t1 + (1 - t1 - t2) * (D - Y * alpha) * (G - D);
  
  return (consultationComponent + assessmentComponent + researchComponent) / denominator;
}

/**
 * Calculate P0 - probability of having no student in the consultation system
 * @param {number} K - Number of students per staff
 * @param {number} lambda - Rate at which students consult lecturer per hour
 * @param {number} mu - Rate at which lecturer attends to students per hour
 * @returns {number} Probability P0
 */
function calculateP0(K, lambda, mu) {
  const rho = lambda / mu;
  let sum = 0;
  
  // Calculate the sum part of P0 formula
  for (let n = 0; n <= K; n++) {
    if (n <= mu) {
      sum += Math.pow(rho, n) / factorial(n);
    } else {
      sum += Math.pow(rho, n) / (factorial(mu) * Math.pow(mu, n - mu));
    }
  }
  
  return 1 / sum;
}

/**
 * Calculate waiting time W
 * @param {number} K - Number of students per staff
 * @param {number} lambda - Rate at which students consult lecturer per hour
 * @param {number} mu - Rate at which lecturer attends to students per hour
 * @param {number} P0 - Probability of having no student in the consultation system
 * @returns {number} Expected waiting time W
 */

function calculateWaitingTime(K, lambda, mu, P0) {
  const rho = lambda / mu;
  let numerator = 0;
  
  for (let n = mu; n <= K; n++) {
    const nFact = factorial(n);
    const combination = binomialCoefficient(n, mu);
    numerator += (n - mu) * Math.pow(rho, n) * combination * P0;
  }
  
  return numerator / (mu * mu * (1 - P0));
}

/**
 * Calculate factorial of n
 * @param {number} n - Number to calculate factorial for
 * @returns {number} n!
 */

function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Calculate binomial coefficient C(n,k)
 * @param {number} n - Total number of items
 * @param {number} k - Number of items to choose
 * @returns {number} Binomial coefficient
 */
function binomialCoefficient(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k));
}

/**
 * Find the optimal student-teacher ratio K*
 * @param {Object} params - Configuration parameters (same as calculateUtilizationFunction)
 * @param {number} maxK - Maximum K value to consider
 * @returns {number} Optimal student-teacher ratio K*
 */
function findOptimalStudentTeacherRatio(params, maxK = 100) {
  let maxH = -Infinity;
  let optimalK = 0;
  
  for (let k = 1; k <= maxK; k++) {
    const paramsWithK = { ...params, K: k };
    const h = calculateUtilizationFunction(paramsWithK);
    
    if (h > maxH) {
      maxH = h;
      optimalK = k;
    } else if (h < maxH) {
      // If H starts decreasing, we've passed the maximum (due to concavity)
      break;
    }
  }
  
  return optimalK;
}

/**
 * Calculate required staff distribution based on student population and optimal ratio
 * @param {number} studentPopulation - Total number of students
 * @param {number} optimalRatio - Optimal student-teacher ratio K*
 * @param {Object} staffMix - Proportions of different staff levels (should sum to 1)
 * @returns {Object} Staff distribution by level
 */
function calculateStaffDistribution(studentPopulation, optimalRatio, staffMix) {
  const totalStaffNeeded = Math.ceil(studentPopulation / optimalRatio);
  
  const staffDistribution = {};
  for (const [title, proportion] of Object.entries(staffMix)) {
    staffDistribution[title] = Math.round(totalStaffNeeded * proportion);
  }
  
  return {
    totalStaffNeeded,
    staffDistribution
  };
}

/**
 * Calculate supervisory and management staff requirements
 * @param {number} operationalStaff - Number of staff in operational positions
 * @param {Object} ratios - Supervisory and management ratios at each level
 * @returns {Object} Staff requirements at each level
 */
function calculateHierarchicalStaffing(operationalStaff, ratios) {
  const { supervisory, management1, management2, topManagement } = ratios;
  
  const supervisoryStaff = Math.ceil(operationalStaff / supervisory);
  const managementStaff1 = Math.ceil(supervisoryStaff / management1);
  const managementStaff2 = Math.ceil(managementStaff1 / management2);
  const topManagementStaff = Math.ceil(managementStaff2 / topManagement);
  
  const totalStaff = operationalStaff + supervisoryStaff + 
                     managementStaff1 + managementStaff2 + topManagementStaff;
  
  return {
    operationalStaff,
    supervisoryStaff,
    managementStaff1,
    managementStaff2,
    topManagementStaff,
    totalStaff
  };
}

/**
 * Apply staff reduction percentage across all levels
 * @param {Object} staffing - Current staffing levels
 * @param {number} reductionPercentage - Percentage to reduce staff by (0-100)
 * @returns {Object} Reduced staffing levels
 */
function applyStaffReduction(staffing, reductionPercentage) {
  const reductionFactor = 1 - (reductionPercentage / 100);
  
  const reducedStaffing = {};
  for (const [level, count] of Object.entries(staffing)) {
    if (typeof count === 'number') {
      reducedStaffing[level] = Math.ceil(count * reductionFactor);
    } else {
      reducedStaffing[level] = count; // Preserve non-numeric properties
    }
  }
  
  // Recalculate total if it exists
  if ('totalStaff' in staffing) {
    reducedStaffing.totalStaff = Object.values(reducedStaffing)
      .filter(value => typeof value === 'number' && value !== reducedStaffing.totalStaff)
      .reduce((sum, value) => sum + value, 0);
  }
  
  return reducedStaffing;
}

// Example usage:
// const params = {
//   K: 20,        // Students per staff
//   D: 40,        // Total official hours per week
//   Y: 3,         // Average weekly lecture hours per course
//   alpha: 4,     // Number of courses per week
//   t1: 0.4,      // Proportion for student consultation
//   t2: 0.4,      // Proportion for research
//   t3: 0.2,      // Proportion for assessment
//   t4: 0.5,      // Hours to assess one student's work 
//   G: 168,       // Total hours in week (24*7)
//   lambda: 5,    // Students consulting per hour
//   mu: 3,        // Students attended to per hour
//   S0: 0.3       // Probability of research outside work hours
// };
// 
// const optimalK = findOptimalStudentTeacherRatio(params);
// console.log(`Optimal student-teacher ratio: ${optimalK}`);
// 
// const staffDistribution = calculateStaffDistribution(10000, optimalK, {
//   'Lecturers': 0.5,
//   'Senior Lecturers': 0.3,
//   'Professors': 0.2
// });
// console.log(staffDistribution);
// 
// const registryStaffing = calculateHierarchicalStaffing(672, {
//   supervisory: 11,
//   management1: 8,
//   management2: 4, 
//   topManagement: 3
// });
// console.log(registryStaffing);
// 
// const reducedStaffing = applyStaffReduction(registryStaffing, 50);
// console.log(reducedStaffing);
