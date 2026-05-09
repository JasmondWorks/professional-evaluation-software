// Types for your database structure
interface StressData {
  stress_category: number;
  stress_theme_form: number;
  stress_feeling_frequency_form: number;
}

interface UserPerformanceData {
  competence: number;
  integrity: number;
  compatibility: number;
  use_of_resources: number;
}

interface AppraisalData {
  teaching_quality_evaluation: number;
  research_quality_evaluation: number;
  administrative_quality_evaluation: number;
  community_quality_evaluation: number;
}

interface StaffRecord {
  id: string;
  departmentId: string;
  facultyId: string;
  stress: StressData;
  userperformance: UserPerformanceData;
  appraisal: AppraisalData;
}

interface DepartmentData {
  departmentId: string;
  departmentName: string;
  records: StaffRecord[];
}

interface StatisticalResult {
  isValid: boolean;
  reason?: string;
  skewness: number;
  kurtosis: number;
  fMax?: number;
  normalityTest: 'PASSED' | 'FAILED';
  homogeneityTest: 'PASSED' | 'FAILED';
  recommendedAlpha: number;
  useBrownForsythe: boolean;
}

class DataFittingModel {
  private readonly MIN_SAMPLE_SIZE = 15;
  private readonly NORMALITY_THRESHOLD = 1.0;
  private readonly HETEROGENEITY_THRESHOLD = 3.0;

  /**
   * Main method to apply data fitting model to your database structure
   */
  async applyDataFittingModel(
    departments: DepartmentData[]
  ): Promise<Map<string, StatisticalResult>> {
    const results = new Map<string, StatisticalResult>();

    for (const dept of departments) {
      // Step 1: Check minimum sample size
      if (dept.records.length < this.MIN_SAMPLE_SIZE) {
        results.set(dept.departmentId, {
          isValid: false,
          reason: `Sample size (${dept.records.length}) is less than minimum required (${this.MIN_SAMPLE_SIZE})`,
          skewness: 0,
          kurtosis: 0,
          normalityTest: 'FAILED',
          homogeneityTest: 'FAILED',
          recommendedAlpha: 0.05,
          useBrownForsythe: false
        });
        continue;
      }

      // Step 2: Remove outliers and perform random sampling
      const cleanedData = await this.removeOutliersAndSample(dept.records);
      
      // Step 3: Extract all numerical values for analysis
      const allValues = this.extractAllNumericalValues(cleanedData);
      
      // Step 4: Calculate skewness and kurtosis
      const skewness = this.calculateSkewness(allValues);
      const kurtosis = this.calculateKurtosis(allValues);
      
      // Step 5: Check normality
      const isNormal = this.checkNormality(skewness, kurtosis);
      
      // Step 6: Calculate Fmax for homogeneity test
      const fMax = this.calculateFMax(cleanedData);
      const isHomogeneous = fMax <= this.HETEROGENEITY_THRESHOLD;
      
      // Step 7: Determine recommended alpha and test method
      let recommendedAlpha = 0.05;
      let useBrownForsythe = false;
      
      if (!isNormal) {
        recommendedAlpha = 0.001; // More stringent alpha
      }
      
      if (!isHomogeneous) {
        recommendedAlpha = 0.025; // More stringent alpha for heterogeneity
        useBrownForsythe = true; // Recommend Brown-Forsythe test
      }

      results.set(dept.departmentId, {
        isValid: isNormal && isHomogeneous,
        skewness,
        kurtosis,
        fMax,
        normalityTest: isNormal ? 'PASSED' : 'FAILED',
        homogeneityTest: isHomogeneous ? 'PASSED' : 'FAILED',
        recommendedAlpha,
        useBrownForsythe
      });
    }

    return results;
  }

  /**
   * Remove outliers using IQR method and perform random sampling
   */
  private async removeOutliersAndSample(records: StaffRecord[]): Promise<StaffRecord[]> {
    // Extract all numerical values for outlier detection
    const allValues = this.extractAllNumericalValues(records);
    
    // Calculate quartiles
    const sorted = [...allValues].sort((a, b) => a - b);
    const q1 = this.calculateQuartile(sorted, 0.25);
    const q3 = this.calculateQuartile(sorted, 0.75);
    const iqr = q3 - q1;
    
    // Calculate outlier bounds
    const lowerBound = q1 - (1.5 * iqr);
    const upperBound = q3 + (1.5 * iqr);
    
    // Filter records without outliers
    const cleanedRecords = records.filter(record => {
      const values = this.extractAllNumericalValues([record]);
      return values.every(value => value >= lowerBound && value <= upperBound);
    });
    
    // Perform random sampling if needed
    return this.randomSample(cleanedRecords);
  }

  /**
   * Extract all numerical values from records
   */
  private extractAllNumericalValues(records: StaffRecord[]): number[] {
    const values: number[] = [];
    
    for (const record of records) {
      // Stress data
      values.push(
        record.stress.stress_category,
        record.stress.stress_theme_form,
        record.stress.stress_feeling_frequency_form
      );
      
      // User performance data
      values.push(
        record.userperformance.competence,
        record.userperformance.integrity,
        record.userperformance.compatibility,
        record.userperformance.use_of_resources
      );
      
      // Appraisal data
      values.push(
        record.appraisal.teaching_quality_evaluation,
        record.appraisal.research_quality_evaluation,
        record.appraisal.administrative_quality_evaluation,
        record.appraisal.community_quality_evaluation
      );
    }
    
    return values.filter(value => !isNaN(value) && isFinite(value));
  }

  /**
   * Calculate quartile value
   */
  private calculateQuartile(sortedArray: number[], percentile: number): number {
    const index = percentile * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  /**
   * Perform random sampling
   */
  private randomSample(records: StaffRecord[]): StaffRecord[] {
    const shuffled = [...records].sort(() => Math.random() - 0.5);
    return shuffled;
  }

  /**
   * Calculate skewness using the formula from the document
   */
  private calculateSkewness(values: number[]): number {
    const n = values.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    
    const numerator = values.reduce((sum, val) => sum + Math.pow(val - mean, 3), 0) / n;
    const denominator = Math.pow(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n,
      1.5
    );
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate kurtosis using the formula from the document
   */
  private calculateKurtosis(values: number[]): number {
    const n = values.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    
    const numerator = values.reduce((sum, val) => sum + Math.pow(val - mean, 4), 0) / n;
    const denominator = Math.pow(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n,
      2
    );
    
    return denominator === 0 ? 0 : (numerator / denominator) - 3; // Excess kurtosis
  }

  /**
   * Check normality based on skewness and kurtosis
   */
  private checkNormality(skewness: number, kurtosis: number): boolean {
    return Math.abs(skewness) <= this.NORMALITY_THRESHOLD && 
           Math.abs(kurtosis) <= this.NORMALITY_THRESHOLD;
  }

  /**
   * Calculate Fmax for homogeneity test (Hartley's test)
   */
  private calculateFMax(records: StaffRecord[]): number {
    // Group data by categories and calculate variances
    const stressValues = records.map(r => [
      r.stress.stress_category,
      r.stress.stress_theme_form,
      r.stress.stress_feeling_frequency_form
    ]).flat();
    
    const performanceValues = records.map(r => [
      r.userperformance.competence,
      r.userperformance.integrity,
      r.userperformance.compatibility,
      r.userperformance.use_of_resources
    ]).flat();
    
    const appraisalValues = records.map(r => [
      r.appraisal.teaching_quality_evaluation,
      r.appraisal.research_quality_evaluation,
      r.appraisal.administrative_quality_evaluation,
      r.appraisal.community_quality_evaluation
    ]).flat();
    
    const variances = [
      this.calculateVariance(stressValues),
      this.calculateVariance(performanceValues),
      this.calculateVariance(appraisalValues)
    ].filter(v => v > 0);
    
    if (variances.length === 0) return 0;
    
    const maxVariance = Math.max(...variances);
    const minVariance = Math.min(...variances);
    
    return minVariance === 0 ? Infinity : maxVariance / minVariance;
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / (values.length - 1);
  }

  /**
   * Perform Kolmogorov-Smirnov test (simplified implementation)
   */
  private kolmogorovSmirnovTest(values: number[]): { statistic: number; pValue: number } {
    // This is a simplified implementation
    // In production, you might want to use a specialized statistics library
    const n = values.length;
    const sorted = [...values].sort((a, b) => a - b);
    
    // Calculate empirical CDF vs theoretical normal CDF
    let maxDiff = 0;
    for (let i = 0; i < n; i++) {
      const empiricalCDF = (i + 1) / n;
      const theoreticalCDF = this.normalCDF(sorted[i]);
      maxDiff = Math.max(maxDiff, Math.abs(empiricalCDF - theoreticalCDF));
    }
    
    // Critical value approximation
    const criticalValue = 1.36 / Math.sqrt(n);
    
    return {
      statistic: maxDiff,
      pValue: maxDiff > criticalValue ? 0.01 : 0.1 // Simplified p-value
    };
  }

  /**
   * Normal CDF approximation
   */
  private normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  /**
   * Error function approximation
   */
  private erf(x: number): number {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Generate comprehensive analysis report
   */
  generateAnalysisReport(results: Map<string, StatisticalResult>): string {
    let report = "=== ACADEMIC STAFF DATA FITTING ANALYSIS REPORT ===\n\n";
    
    const validDepartments: string[] = [];
    const invalidDepartments: string[] = [];
    
    for (const [deptId, result] of Array.from(results.entries())) {
      report += `Department: ${deptId}\n`;
      report += `Status: ${result.isValid ? 'VALID' : 'INVALID'}\n`;
      
      if (!result.isValid && result.reason) {
        report += `Reason: ${result.reason}\n`;
      }
      
      report += `Skewness: ${result.skewness.toFixed(4)}\n`;
      report += `Kurtosis: ${result.kurtosis.toFixed(4)}\n`;
      
      if (result.fMax !== undefined) {
        report += `F-max: ${result.fMax.toFixed(4)}\n`;
      }
      
      report += `Normality Test: ${result.normalityTest}\n`;
      report += `Homogeneity Test: ${result.homogeneityTest}\n`;
      report += `Recommended Alpha: ${result.recommendedAlpha}\n`;
      report += `Use Brown-Forsythe: ${result.useBrownForsythe ? 'YES' : 'NO'}\n`;
      report += `\n${'-'.repeat(50)}\n\n`;
      
      if (result.isValid) {
        validDepartments.push(deptId);
      } else {
        invalidDepartments.push(deptId);
      }
    }
    
    report += `SUMMARY:\n`;
    report += `Valid Departments: ${validDepartments.length}\n`;
    report += `Invalid Departments: ${invalidDepartments.length}\n`;
    
    if (invalidDepartments.length > 0) {
      report += `\nExcluded Departments: ${invalidDepartments.join(', ')}\n`;
    }
    
    return report;
  }
}

// Usage example
async function analyzeAcademicStaffData(staffData: DepartmentData[]): Promise<void> {
  const model = new DataFittingModel();
  
  try {
    // Apply the data fitting model
    const results = await model.applyDataFittingModel(staffData);
    
    // Generate and display report
    const report = model.generateAnalysisReport(results);
    console.log(report);
    
    // You can also access individual department results
    results.forEach((result, deptId) => {
      if (result.isValid) {
        console.log(`Department ${deptId} is ready for ANOVA analysis`);
        
        if (result.useBrownForsythe) {
          console.log(`- Recommend using Brown-Forsythe test (F*) instead of regular F-test`);
        }
        
        console.log(`- Use alpha level: ${result.recommendedAlpha}`);
      } else {
        console.log(`Department ${deptId} excluded from analysis: ${result.reason}`);
      }
    });
  } catch (error) {
    console.error('Error during data fitting analysis:', error);
  }
}

export { 
  DataFittingModel, 
  type StaffRecord, 
  type DepartmentData, 
  type StatisticalResult,
  analyzeAcademicStaffData
};