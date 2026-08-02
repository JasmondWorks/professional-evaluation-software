"use client";

import Link from "next/link";
import { useState } from "react";
import { apiFetch } from '@/app/utils/apiFetch';

type DeptProps = {
  data: {
    dept: string;
    total_unique_users: number;
    total?: number;
    submitted?: number;
  };
};

export default function Dept({ data }: DeptProps) {
  const [status, setStatus] = useState<
    null | "passed" | "outliers" | "notEnough"
  >(null);
  const [outliers, setOutliers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function runTest() {
    setLoading(true);
    setStatus(null);
    setOutliers([]);

    try {
      const dept = encodeURIComponent(data.dept);
      // Pull actual appraisal + performance scores for the department. (The old
      // getDataEntryByDept endpoint required auth and returned only names, so it
      // always produced "not enough data".)
      const [appraisals, performances] = await Promise.all([
        apiFetch(`/api/getAppraisalByDept?dept=${dept}`)
          .then((r) => r.json())
          .catch(() => []),
        apiFetch(`/api/getPerformanceByDept?dept=${dept}`)
          .then((r) => r.json())
          .catch(() => []),
      ]);

      const appraisalList: any[] = Array.isArray(appraisals) ? appraisals : [];
      const performanceList: any[] = Array.isArray(performances) ? performances : [];

      // Sum each user's available scores across both sources (union of users).
      const userScores: { [user: string]: number } = {};
      const addScores = (name: string, vals: unknown[]) => {
        if (!name) return;
        const nums = vals.filter((v): v is number => typeof v === "number" && !isNaN(v));
        if (nums.length === 0) return;
        userScores[name] = (userScores[name] ?? 0) + nums.reduce((s, x) => s + x, 0);
      };

      appraisalList.forEach((a) =>
        addScores(a.pesuser_name, [
          a.teaching_quality,
          a.community_quality,
          a.administrative_quality,
          a.research_quality,
        ]),
      );
      performanceList.forEach((p) =>
        addScores(p.pesuser_name, [
          p.competence,
          p.compatibility,
          p.integrity,
          p.use_of_resources,
        ]),
      );

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
          <p className="font-semibold text-md">
            {data.dept.toLowerCase().endsWith("department")
              ? data.dept
              : `${data.dept} department`}
          </p>
          <p className="text-muted text-sm">
            {(data.submitted ?? data.total_unique_users)} of {(data.total ?? data.total_unique_users)} staff submitted
          </p>
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
          <p className="text-green-600 font-semibold">
            ✅ Data Integrity Passed
          </p>
          <Link
            href={`/evaluation?dept=${data.dept}`}
            className="mt-3 inline-block text-center text-white bg-green-600 px-6 py-2 rounded-md hover:bg-green-700 transition-all"
          >
            Assess Employees
          </Link>
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
