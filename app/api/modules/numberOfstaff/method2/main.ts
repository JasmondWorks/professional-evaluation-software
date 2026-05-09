// METHOD 2: FACTORED ESTIMATING
// ==============================

interface TaskData {
  observed: number;
  estimated: number;
}

/**
 * Corrective factor for individual task
 * Formula: (Oi - Ei) / Ei
 */
function calculateTaskCorrectiveFactor(observed: number, estimated: number): number {
  return (observed - estimated) / estimated;
}

/**
 * Calculate overall corrective factor
 * Formula: Σ(Oi - Ei) / Σ(Ei)
 */
function calculateOverallCorrectiveFactor(tasks: TaskData[]): number {
  const totalDifference = tasks.reduce((sum, task) => 
    sum + (task.observed - task.estimated), 0);

  const totalEstimated = tasks.reduce((sum, task) => 
    sum + task.estimated, 0);
  
  return totalDifference / totalEstimated;
}

/**
 * Corrected estimate for a new task
 * Formula: Person's estimate × (1 + corrective factor)
 */
function calculateCorrectedEstimate( personEstimate: number, correctiveFactor: number): number {
  return personEstimate * (1 + correctiveFactor);
}

/**
 * Basic time
 * Formula: Corrected estimate × (performance rating / 100)
 */
function calculateBasicTime(
  correctedEstimate: number, 
  performanceRating: number
): number {
  return correctedEstimate * (performanceRating / 100);
}

/**
 * Calculate standard time
 * Formula: Basic time × (1 + allowance percentage)
 */
function calculateStandardTime(
  basicTime: number, 
  allowancePercentage: number
): number {
  return basicTime * (1 + allowancePercentage / 100);
}

/**
 * Complete factored estimating calculation
 */
function factoredEstimating(
  historicalTasks: TaskData[],
  newTaskEstimate: number,
  performanceRating: number,
  allowancePercentage: number
) {
  // Calculate overall corrective factor from historical data
  const correctiveFactor = calculateOverallCorrectiveFactor(historicalTasks);
  
  // Calculate corrected estimate for new task
  const correctedEstimate = calculateCorrectedEstimate(newTaskEstimate, correctiveFactor);
  
  // Calculate basic time
  const basicTime = calculateBasicTime(correctedEstimate, performanceRating);
  
  // Calculate standard time
  const standardTime = calculateStandardTime(basicTime, allowancePercentage);
  
  return {
    correctiveFactor,
    correctedEstimate,
    basicTime,
    standardTime,
    breakdown: {
      historicalTasks: historicalTasks.map(task => ({
        observed: task.observed,
        estimated: task.estimated,
        individualCorrectiveFactor: calculateTaskCorrectiveFactor(task.observed, task.estimated)
      }))
    }
  };
}

// EXAMPLE USAGE
// =============

// Historical task data from the example
const historicalTasks: TaskData[] = [
  { observed: 0.6, estimated: 0.75 },   // Task 1: cleaners pay voucher
  { observed: 1.30, estimated: 1.60 },  // Task 2: permanent junior staff voucher
  { observed: 1.20, estimated: 1.30 },  // Task 3: senior staff voucher
  { observed: 0.03, estimated: 0.04 }   // Task 4: car maintenance pay voucher
];

// New task estimate
const newTaskEstimate = 1.8; // hours for "write voucher for casual"
const performanceRating = 125; // 125%
const allowancePercentage = 9; // 9%

// Calculate using factored estimating
const result = factoredEstimating(
  historicalTasks,
  newTaskEstimate,
  performanceRating,
  allowancePercentage
);

console.log('Factored Estimating Results:');
console.log('============================');
console.log(`Corrective Factor: ${result.correctiveFactor.toFixed(4)}`);
console.log(`Corrected Estimate: ${result.correctedEstimate.toFixed(4)} hrs`);
console.log(`Basic Time: ${result.basicTime.toFixed(4)} hrs`);
console.log(`Standard Time: ${result.standardTime.toFixed(4)} hrs`);

console.log('\nHistorical Tasks Breakdown:');
result.breakdown.historicalTasks.forEach((task, index) => {
  console.log(`Task ${index + 1}: O=${task.observed}, E=${task.estimated}, CF=${task.individualCorrectiveFactor.toFixed(4)}`);
});

// Utility functions for specific calculations
export {
  factoredEstimating
};
 