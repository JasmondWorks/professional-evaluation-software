'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, BarChart3, FileText } from 'lucide-react';

/* ----------------- Types ----------------- */
interface DataPoint {
  department: string;
  user: string;
  value: number;
}

interface GroupData {
  department: string;
  user: string;
  values: number[];
  mean: number;
  variance: number;
  sampleSize: number;
}

interface Data {
  userperformance: {
    competence: number;
    integrity: number;
    compatibility: number;
    use_of_resources: number;
    pesuser_name: string;
  }[];
  appraisal: {
    teaching_quality_evaluation: number;
    research_quality_evaluation: number;
    administrative_quality_evaluation: number;
    community_quality_evaluation: number;
    pesuser_name: string;
  }[];
}

interface Outlier {
  department: string;
  user: string;
  value: number;
  zScore?: number;
}

interface StatisticalResults {
  groups: GroupData[];
  sseR: number;
  sseF: number;
  skewness: number;
  kurtosis: number;
  fMax: number;
  leveneStatistic: number;
  fStatistic: number;
  fCritical: number;
  iqrOutliers: Outlier[];
  zScoreOutliers: Outlier[];
  isNormallyDistributed: boolean;
  hasEqualVariances: boolean;
  recommendedAlpha: number;
  analysisRecommendation: string;
  passedCount: number;
}

/* ----------------- Utilities ----------------- */
const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
const variance = (arr: number[]) => {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
};

/* IQR outlier detection */
function filterIQR(dataset: DataPoint[]): { cleaned: DataPoint[]; outliers: Outlier[] } {
  const values = dataset.map(d => d.value).sort((a, b) => a - b);
  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;

  const cleaned: DataPoint[] = [];
  const outliers: Outlier[] = [];

  dataset.forEach(d => {
    if (d.value < lower || d.value > upper) {
      outliers.push({ department: d.department, user: d.user, value: d.value });
    } else {
      cleaned.push(d);
    }
  });

  return { cleaned, outliers };
}

/* Z-score outlier detection */
function detectZScoreOutliers(groups: GroupData[]): Outlier[] {
  const outliers: Outlier[] = [];
  groups.forEach(g => {
    const stdDev = Math.sqrt(g.variance);
    if (stdDev === 0) return;
    g.values.forEach(v => {
      const z = Math.abs((v - g.mean) / stdDev);
      if (z > 2.58) outliers.push({ department: g.department, user: g.user, value: v, zScore: z });
    });
  });
  return outliers;
}

/* ----------------- ResultsView ----------------- */
const ResultsView: React.FC<{ results: StatisticalResults; dept: string; type: string }> = ({ results, dept, type }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold mb-2">
      <BarChart3 className="inline mr-2" /> {type} Results for {dept}
    </h2>
    <p
      className={`font-semibold mb-4 ${
        results.passedCount >= 15 && results.iqrOutliers.length === 0 && results.zScoreOutliers.length === 0
          ? 'text-green-600'
          : 'text-red-600'
      }`}
    >
      {results.passedCount} users passed data integrity test
    </p>

    {results.iqrOutliers.length > 0 && (
      <div className="mb-4">
        <h3 className="font-semibold text-red-600">IQR Outliers ({results.iqrOutliers.length})</h3>
        <ul className="list-disc pl-6">
          {results.iqrOutliers.map((o, i) => (
            <li key={i}>{o.user} – {o.value}</li>
          ))}
        </ul>
      </div>
    )}

    {results.zScoreOutliers.length > 0 && (
      <div className="mb-4">
        <h3 className="font-semibold text-red-600">Z-Score Outliers ({results.zScoreOutliers.length})</h3>
        <ul className="list-disc pl-6">
          {results.zScoreOutliers.map((o, i) => (
            <li key={i}>{o.user} – {o.value} (z={o.zScore?.toFixed(2)})</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

/* ----------------- Main Component ----------------- */
export default function StatisticalAnalysisPage() {
  const searchParams = useSearchParams();
  const dept = searchParams.get("dept") || "Unknown Department";

  const [appraisalResults, setAppraisalResults] = useState<StatisticalResults | null>(null);
  const [performanceResults, setPerformanceResults] = useState<StatisticalResults | null>(null);

  useEffect(() => {
    const fetchDataset = async () => {
      const res = await fetch(`/api/getDataScores?dept=${encodeURIComponent(dept)}`);
      const data: Data = await res.json();

      const appraisal = data.appraisal.flatMap(a => [
        { department: dept, user: a.pesuser_name, value: a.teaching_quality_evaluation },
        { department: dept, user: a.pesuser_name, value: a.research_quality_evaluation },
        { department: dept, user: a.pesuser_name, value: a.administrative_quality_evaluation },
        { department: dept, user: a.pesuser_name, value: a.community_quality_evaluation },
      ]);

      const performance = data.userperformance.flatMap(u => [
        { department: dept, user: u.pesuser_name, value: u.competence },
        { department: dept, user: u.pesuser_name, value: u.integrity },
        { department: dept, user: u.pesuser_name, value: u.compatibility },
        { department: dept, user: u.pesuser_name, value: u.use_of_resources },
      ]);

      runAnalysis(appraisal, 'appraisal');
      runAnalysis(performance, 'performance');
    };
    fetchDataset();
  }, [dept]);

  const runAnalysis = (dataset: DataPoint[], type: 'appraisal' | 'performance') => {
    if (dataset.length === 0) return;

    // Step 1: filter outliers (IQR)
    const { cleaned, outliers: iqrOutliers } = filterIQR(dataset);

    // Step 2: group per user
    const grouped = cleaned.reduce((acc, d) => {
      const key = d.user;
      if (!acc[key]) acc[key] = { department: d.department, user: d.user, values: [] as number[] };
      acc[key].values.push(d.value);
      return acc;
    }, {} as Record<string, { department: string; user: string; values: number[] }>);

    const groups: GroupData[] = Object.values(grouped).map(g => ({
      ...g,
      mean: mean(g.values),
      variance: variance(g.values),
      sampleSize: g.values.length,
    }));

    // Step 3: detect z-score outliers
    const zScoreOutliers = detectZScoreOutliers(groups);

    // Step 4: package results
    const results: StatisticalResults = {
      groups,
      sseR: 0,
      sseF: 0,
      skewness: 0,
      kurtosis: 0,
      fMax: 0,
      leveneStatistic: 0,
      fStatistic: 0,
      fCritical: 0,
      iqrOutliers,
      zScoreOutliers,
      isNormallyDistributed: true,
      hasEqualVariances: true,
      recommendedAlpha: 0.05,
      analysisRecommendation: '',
      passedCount: groups.length,
    };

    if (type === 'appraisal') setAppraisalResults(results);
    else setPerformanceResults(results);
  };

  return (
    <div className="container mx-auto py-10">
      {appraisalResults && <ResultsView results={appraisalResults} dept={dept} type="Appraisal" />}
      {performanceResults && <ResultsView results={performanceResults} dept={dept} type="Performance" />}
    </div>
  );
}
