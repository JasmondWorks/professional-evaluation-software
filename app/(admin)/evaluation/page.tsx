"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Upload, BarChart3, FileText } from "lucide-react";
import { getAccessToken } from "@/app/utils/auth";
import { apiFetch } from '@/app/utils/apiFetch';
import { Card, CardHeader, CardBody, Badge, DataTable } from "@/app/components/ui";

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
    // Null while a criterion is still with the staff member or the auditor —
    // held out of the analysis rather than charted as a zero.
    competence: number | null;
    integrity: number | null;
    compatibility: number | null;
    use_of_resources: number | null;
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
function filterIQR(dataset: DataPoint[]): {
  cleaned: DataPoint[];
  outliers: Outlier[];
} {
  const values = dataset.map((d) => d.value).sort((a, b) => a - b);
  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;

  const cleaned: DataPoint[] = [];
  const outliers: Outlier[] = [];

  dataset.forEach((d) => {
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
  groups.forEach((g) => {
    const stdDev = Math.sqrt(g.variance);
    if (stdDev === 0) return;
    g.values.forEach((v) => {
      const z = Math.abs((v - g.mean) / stdDev);
      if (z > 2.58)
        outliers.push({
          department: g.department,
          user: g.user,
          value: v,
          zScore: z,
        });
    });
  });
  return outliers;
}

/* ----------------- ResultsView ----------------- */
const ResultsView: React.FC<{
  results: StatisticalResults;
  dept: string;
  type: string;
}> = ({ results, dept, type }) => {
  const isHealthy =
    results.passedCount >= 15 &&
    results.iqrOutliers.length === 0 &&
    results.zScoreOutliers.length === 0;

  const outlierColumns = [
    { key: "user", label: "User", width: "50%" },
    { key: "value", label: "Value", width: "25%" },
    { 
      key: "zScore", 
      label: "Z-Score", 
      width: "25%", 
      render: (o: Outlier) => o.zScore != null ? o.zScore.toFixed(2) : "-" 
    },
  ];

  return (
    <Card className="mb-8 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-surface border-b border-line">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pes-50 text-pes-600 rounded-lg">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-strong">
              {type} Results for {dept}
            </h2>
            <p className="text-sm text-muted">
              Statistical analysis of evaluation data
            </p>
          </div>
        </div>
        <Badge tone={isHealthy ? "success" : "warning"} dot>
          {results.passedCount} users passed
        </Badge>
      </CardHeader>

      <CardBody className="space-y-6 bg-canvas p-6">
        {results.iqrOutliers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-strong flex items-center gap-2">
                <FileText size={16} className="text-muted" /> IQR Outliers
              </h3>
              <Badge tone="danger">{results.iqrOutliers.length} detected</Badge>
            </div>
            <DataTable
              columns={outlierColumns}
              data={results.iqrOutliers}
            />
          </div>
        )}

        {results.zScoreOutliers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-strong flex items-center gap-2">
                <FileText size={16} className="text-muted" /> Z-Score Outliers
              </h3>
              <Badge tone="danger">{results.zScoreOutliers.length} detected</Badge>
            </div>
            <DataTable
              columns={outlierColumns}
              data={results.zScoreOutliers}
            />
          </div>
        )}
        
        {results.iqrOutliers.length === 0 && results.zScoreOutliers.length === 0 && (
          <div className="py-8 text-center bg-surface border border-line rounded-xl border-dashed">
            <p className="text-muted font-medium">No outliers detected in the data.</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

/* ----------------- Main Component ----------------- */
export default function StatisticalAnalysisPage() {
  const searchParams = useSearchParams();
  const dept = searchParams.get("dept") || "Unknown Department";

  const [appraisalResults, setAppraisalResults] =
    useState<StatisticalResults | null>(null);
  const [performanceResults, setPerformanceResults] =
    useState<StatisticalResults | null>(null);

  useEffect(() => {
    const fetchDataset = async () => {
      const token = getAccessToken();
      const res = await apiFetch(`/api/getDataScores?dept=${encodeURIComponent(dept)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        console.error(
          "Failed to fetch data scores:",
          res.status,
          res.statusText,
        );
        return;
      }

      const data: Data = await res.json();

      const appraisal = (data.appraisal ?? []).flatMap((a) => [
        {
          department: dept,
          user: a.pesuser_name,
          value: a.teaching_quality_evaluation,
        },
        {
          department: dept,
          user: a.pesuser_name,
          value: a.research_quality_evaluation,
        },
        {
          department: dept,
          user: a.pesuser_name,
          value: a.administrative_quality_evaluation,
        },
        {
          department: dept,
          user: a.pesuser_name,
          value: a.community_quality_evaluation,
        },
      ]);

      const performance = (data.userperformance ?? []).flatMap((u) =>
        [u.competence, u.integrity, u.compatibility, u.use_of_resources]
          .filter((v): v is number => v !== null && v !== undefined)
          .map((value) => ({ department: dept, user: u.pesuser_name, value })),
      );

      runAnalysis(appraisal, "appraisal");
      runAnalysis(performance, "performance");
    };
    fetchDataset();
  }, [dept]);

  const runAnalysis = (
    dataset: DataPoint[],
    type: "appraisal" | "performance",
  ) => {
    if (dataset.length === 0) return;

    // Step 1: filter outliers (IQR)
    const { cleaned, outliers: iqrOutliers } = filterIQR(dataset);

    // Step 2: group per user
    const grouped = cleaned.reduce(
      (acc, d) => {
        const key = d.user;
        if (!acc[key])
          acc[key] = {
            department: d.department,
            user: d.user,
            values: [] as number[],
          };
        acc[key].values.push(d.value);
        return acc;
      },
      {} as Record<
        string,
        { department: string; user: string; values: number[] }
      >,
    );

    const groups: GroupData[] = Object.values(grouped).map((g) => ({
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
      analysisRecommendation: "",
      passedCount: groups.length,
    };

    if (type === "appraisal") setAppraisalResults(results);
    else setPerformanceResults(results);
  };

  return (
    <div className="container mx-auto py-10 px-5">
      {appraisalResults && (
        <ResultsView results={appraisalResults} dept={dept} type="Appraisal" />
      )}
      {performanceResults && (
        <ResultsView
          results={performanceResults}
          dept={dept}
          type="Performance"
        />
      )}
    </div>
  );
}
