'use client';

import { useEffect, useState } from "react";

type AppraisalEntry = {
  pesuser_name: string;
  dept: string;
  teaching_quality: number;
  community_quality: number;
  administrative_quality: number;
  research_quality: number;
};

type PerformanceEntry = {
  pesuser_name: string;
  dept: string;
  competence: number;
  compatibility: number;
  integrity: number;
  use_of_resources: number;
};

type CombinedEntry = {
  pesuser_name: string;
  dept: string;
  scores: number[];
};

export default function Page({ params }: { params: { dept: string } }) {
  const [data, setData] = useState<CombinedEntry[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const dept = params.dept;

  useEffect(() => {
    Promise.all([
      fetch(`/api/getAppraisalByDept?dept=${encodeURIComponent(dept)}`).then(res => res.json()),
      fetch(`/api/getPerformanceByDept?dept=${encodeURIComponent(dept)}`).then(res => res.json()),
    ])
      .then(([appraisals, performances]) => {
        // Merge appraisal + performance by user
        const combined: CombinedEntry[] = appraisals.map((a: AppraisalEntry) => {
          const perf = performances.find((p: PerformanceEntry) => p.pesuser_name === a.pesuser_name);
          const scores = [
            a.teaching_quality,
            a.community_quality,
            a.administrative_quality,
            a.research_quality,
            perf?.competence,
            perf?.compatibility,
            perf?.integrity,
            perf?.use_of_resources,
          ].filter((s): s is number => typeof s === "number");

          return { pesuser_name: a.pesuser_name, dept: a.dept, scores };
        });

        setData(combined);
        runAnalysis(combined);
      })
      .catch(err => console.error("Error fetching dept data:", err));
  }, [dept]);

  function runAnalysis(entries: CombinedEntry[]) {
    const allScores = entries.flatMap(e => e.scores);

    if (allScores.length < 15) {
      setAnalysis({ status: "error", message: "Not enough data (minimum 15 required)" });
      return;
    }

    // Data integrity: no NaN/null
    const invalid = allScores.filter(s => s == null || isNaN(s));
    if (invalid.length > 0) {
      setAnalysis({ status: "error", message: `Found ${invalid.length} invalid scores` });
      return;
    }

    // Outlier detection (Z-score method)
    const mean = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const stdDev = Math.sqrt(allScores.reduce((a, b) => a + (b - mean) ** 2, 0) / allScores.length);

    const outliers = entries.filter(e =>
      e.scores.some(score => Math.abs((score - mean) / stdDev) > 2)
    );

    if (outliers.length > 0) {
      setAnalysis({
        status: "outliers",
        message: "Outliers found",
        outliers,
      });
    } else {
      setAnalysis({
        status: "success",
        message: "Data integrity passed",
      });
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Department: {dept}</h1>

      {analysis && (
        <div
          className={`mb-6 p-4 border rounded ${
            analysis.status === "success"
              ? "bg-green-100 border-green-500 text-green-700"
              : analysis.status === "outliers"
              ? "bg-red-100 border-red-500 text-red-700"
              : "bg-yellow-100 border-yellow-500 text-yellow-700"
          }`}
        >
          <p className="font-semibold">{analysis.message}</p>

          {analysis.status === "outliers" && (
            <ul className="list-disc pl-5 mt-2">
              {analysis.outliers.map((o: CombinedEntry, idx: number) => (
                <li key={idx}>
                  {o.pesuser_name} — Scores: {o.scores.join(", ")}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {data?.map((item, index) => (
        <div
          key={index}
          className="p-6 my-2 mx-4 border rounded-md bg-white"
        >
          <p className="font-semibold text-md">{item.pesuser_name}</p>
          <p className="text-gray-300 text-sm">{item.dept}</p>
          <p className="text-sm mt-2">
            Scores: {item.scores.join(", ")}
          </p>
        </div>
      ))}
    </div>
  );
}
