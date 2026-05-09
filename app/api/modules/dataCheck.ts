import prisma from '../prisma.dev'

async function getRandomUsers() {
  try {
    const users = await prisma.$queryRaw`
      SELECT * FROM "pesuser" ORDER BY random() LIMIT 15
    `;

    return users;
  } catch (error) {
    console.error('Error fetching random users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ----------------------------------------------
//   TYPES AND INTERFACES
// ----------------------------------------------

interface SsrFObject {
    ssr: number;
    sse: number;
 }
 
 interface SkewKurtObject {
    skewness: number;
    kurtosis: number;
 }

 interface RegressionObject {
    slope: number;
    intercept: number;
 }

// ----------------------------------------------
//  DATA FITING STATISTICAL MODELS
// ----------------------------------------------

 //SSE(R) / SSE(f) Comparison
 function calculateSsrF(numbers: number[], df: number): SsrFObject {
    const n = numbers.length;
    const yBar = numbers.reduce((sum, num) => sum + num, 0) / n;
    const yHat = numbers.map((num) => yBar);
    const ssr = yHat.reduce((sum, yHatVal, i) => sum + (yHatVal - yBar) ** 2, 0);
    const sse = numbers.reduce((sum, num, i) => sum + (num - yHat[i]) ** 2, 0);
 
    return { ssr: ssr / df, sse: sse / (n - df) };
 }
 
 
 //Skewness and Kurtosis
 function calculateSkewKurt(data: number[]): SkewKurtObject {
    const n = data.length;
    const mean = data.reduce((sum, num) => sum + num, 0) / n;
    const variance = data.reduce((sum, num) => sum + (num - mean) ** 2, 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    const skewness = data.reduce((sum, num) => sum + ((num - mean) / stdDev) ** 3, 0) * (n / ((n - 1) * (n - 2)));
    const kurtosis = data.reduce((sum, num) => sum + ((num - mean) / stdDev) ** 4, 0) * ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) - ((3 * (n - 1) ** 2) / ((n - 2) * (n - 3)));
 
    return { skewness, kurtosis };
 }
 
 
 //Linear regression
 function linearRegression(data: [number, number][] ): RegressionObject {
   const n = data.length;
   let xSum = 0;
   let ySum = 0;
   let xySum = 0;
   let xSquaredSum = 0;
 
   for (let i = 0; i < n; i++) {
      const [x, y]: [number, number] = data[i];
      xSum += x;
      ySum += y;
      xySum += x * y;
      xSquaredSum += x * x;
   }

   const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
   const intercept = (ySum - slope * xSum) / n;

   return { slope, intercept };
 }


module.exports = {
   calculateSkewKurt,
   calculateSsrF,
}