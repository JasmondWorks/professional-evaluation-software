"use client";

import { useState } from "react";

type DeptProps = {
  data: {
    dept: string;
    total_unique_users: number;
  };
};

export default function Dept({ data }: DeptProps) {
  const [status, setStatus] = useState<null | "passed" | "outliers" | "notEnough">(null);
  const [outliers, setOutliers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function runTest() {
    setLoading(true);
    setStatus(null);
    setOutliers([]);

    try {
      const response = await fetch(`/api/getDataEntryByDept?dept=${encodeURIComponent(data.dept)}`);
      const records = await response.json();

      if (!Array.isArray(records) || records.length < 15) {
        setStatus("notEnough");
        return;
      }

      const fields = [
        "teaching_quality_evaluation",
        "community_quality_evaluation",
        "administrative_quality_evaluation",
        "research_quality_evaluation",
        "competence",
        "compatibility",
        "integrity",
        "use_of_resources",
      ];

      const userScores: { [user: string]: number } = {};
      records.forEach((rec: any) => {
        const total = fields.reduce((sum, f) => sum + (Number(rec[f]) || 0), 0);
        if (!isNaN(total)) {
          userScores[rec.pesuser_name] = total;
        }
      });

      const scores = Object.values(userScores);
      if (scores.length < 15) {
        setStatus("notEnough");
        return;
      }

      const sorted = [...scores].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length / 4)];
      const q3 = sorted[Math.floor((3 * sorted.length) / 4)];
      const iqr = q3 - q1;
      const lower = q1 - 1.5 * iqr;
      const upper = q3 + 1.5 * iqr;

      const foundOutliers = Object.entries(userScores)
        .filter(([_, score]) => score < lower || score > upper)
        .map(([user]) => user);

      if (foundOutliers.length > 0) {
        setStatus("outliers");
        setOutliers(foundOutliers);
      } else {
        setStatus("passed");
      }
    } catch (err) {
      console.error("Error running test:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col p-6 my-2 mx-4 border rounded-md bg-white">
      <div className="flex justify-between">
        <div className="flex flex-col my-auto">
          <p className="font-semibold text-md">{data.dept} department</p>
          <p className="text-gray-300 text-sm">{data.total_unique_users} data entries recorded</p>
        </div>

        <button
          onClick={runTest}
          disabled={loading}
          className="text-pes border border-pes rounded-md py-3 px-8 hover:text-white hover:bg-pes transition-all"
        >
          {loading ? "Running..." : "Run Data Integrity Test"}
        </button>
      </div>

      {status === "passed" && (
        <div className="mt-4">
          <p className="text-green-600 font-semibold">✅ Data Integrity Passed</p>
          <a
            href={`/evaluation?dept=${data.dept}`}
            className="mt-3 inline-block text-center text-white bg-green-600 px-6 py-2 rounded-md hover:bg-green-700 transition-all"
          >
            Assess Employees
          </a>
        </div>
      )}

      {status === "notEnough" && (
        <p className="mt-4 text-yellow-600 font-semibold">
          ⚠️ Not enough data (minimum 15 required)
        </p>
      )}

      {status === "outliers" && (
        <div className="mt-4">
          <p className="text-red-600 font-semibold">❌ Outliers Found</p>
          <ul className="list-disc ml-6 mt-2">
            {outliers.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
