"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft2 } from "iconsax-react";
import { apiFetch } from '@/app/utils/apiFetch';

type JWTPayload = {
  org?: string;
};

interface UnitHeadRun {
  id: number;
  created_at: string;
  actual_hours: number;
  num_subordinates: number;
  extra_complexity: number;
  optimal_hours: number;
  optimal_k: number;
  complexity_factor: number;
  overload_ratio: number;
  status: string;
}

export default function UnitHeadHistoryPage() {
  const [runs, setRuns] = useState<UnitHeadRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const token = getAccessToken();
        if (!token) throw new Error("No token found");

        const decoded = jwtDecode<JWTPayload>(token);
        const org = decoded.org;
        if (!org) throw new Error("No organization found in token");

        const res = await apiFetch("/api/getUnitHead", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (!res.ok) throw new Error("Failed to fetch history");

        const data = await res.json();
        setRuns(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="p-8 w-full max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pes border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full mx-auto">
      <div className="mb-8">
        <Link
          href="/models/personnel-utilization/unit-head"
          className="inline-flex items-center text-sm text-muted hover:text-pes transition-colors mb-4"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Model
        </Link>
        <h1 className="text-2xl font-bold mb-2">Unit Head Overloading History</h1>
        <p className="text-body">
          Historical records of your unit head overloading calculations.
        </p>
      </div>

      {error ? (
        <div className="bg-danger-50 text-danger-600 p-4 rounded-md">{error}</div>
      ) : runs.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-strong mb-1">No history found</h3>
          <p className="text-muted">You haven't saved any Unit Head Overloading results yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-canvas border-b border-line text-body font-medium">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                  <th className="px-6 py-4">Actual Hrs</th>
                  <th className="px-6 py-4">Optimal Hrs</th>
                  <th className="px-6 py-4">CF</th>
                  <th className="px-6 py-4">OR</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-canvas transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-muted">
                      {dayjs(run.created_at).format("MMM D, YYYY h:mm A")}
                    </td>
                    <td className="px-6 py-4 font-medium">{run.actual_hours}</td>
                    <td className="px-6 py-4 font-medium">{run.optimal_hours}</td>
                    <td className="px-6 py-4 text-muted">{Number(run.complexity_factor).toFixed(3)}</td>
                    <td className="px-6 py-4 font-bold text-pes">{Number(run.overload_ratio).toFixed(3)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          run.status === "Optimal"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : run.status === "Underloaded"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-danger-50 text-danger-700 border-danger-100"
                        }`}
                      >
                        {run.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
