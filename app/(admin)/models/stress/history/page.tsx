"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft2 } from "iconsax-react";
import HistoryChart from "@/app/components/ui/HistoryChart";
import { apiFetch } from '@/app/utils/apiFetch';

interface StressEvaluationRun {
  id: number;
  stress_factor: number;
  pressure_factor: number;
  conflict_factor: number;
  anova_result: string | null;
  created_at: string;
}

export default function StressEvaluationHistory() {
  const [history, setHistory] = useState<StressEvaluationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setRefreshing(true);
    setError(null);
    try {
      // no-store so a manual refresh always hits the server, never a cached copy.
      const res = await apiFetch("/api/getStressEvaluation", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json().catch(() => []);
      // Always store an array so the render can never crash on .map / bad shapes.
      setHistory(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError("Error loading history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Keep it current without a manual refresh: refetch when the tab regains focus.
    const onFocus = () => fetchHistory();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link
            href="/models/stress"
            className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors mb-2"
          >
            <ArrowLeft2 size="16" className="mr-1" /> Back to Stress Evaluation
            Model
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Stress Evaluation History
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review past organizational stress evaluations and ANOVA results.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          disabled={refreshing}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
        >
          {refreshing && (
            <span className="animate-spin h-4 w-4 border-b-2 border-gray-500 rounded-full" />
          )}
          {refreshing ? "Refreshing…" : "Refresh Data"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pes mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading history data...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No history found
          </h3>
          <p className="text-gray-500">
            Run the Stress Evaluation model and save results to see them here.
          </p>
        </div>
      ) : (
        <>
          <HistoryChart
            data={history}
            dataKey="stress_factor"
            name="Overall Stress"
            color="#ef4444"
            formatter={(val) => `${Number(val).toFixed(1)}%`}
          />
          <div className="grid gap-6">
            {history.map((run) => {
              // Parse defensively — a malformed stored value must never crash the page.
              let parsedAnova: any = null;
              try {
                parsedAnova = run.anova_result ? JSON.parse(run.anova_result) : null;
              } catch {
                parsedAnova = null;
              }

              return (
                <div
                  key={run.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        ID: {run.id}
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {dayjs(run.created_at).format("MMM D, YYYY • h:mm A")}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Aggregates */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex flex-col justify-center items-center text-center h-full">
                        <span className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">
                          Stress
                        </span>
                        <span className="text-2xl font-bold text-red-900">
                          {Number(run.stress_factor).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex flex-col justify-center items-center text-center h-full">
                        <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-2">
                          Pressure
                        </span>
                        <span className="text-2xl font-bold text-orange-900">
                          {Number(run.pressure_factor).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex flex-col justify-center items-center text-center h-full">
                        <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wider mb-2">
                          Conflict
                        </span>
                        <span className="text-2xl font-bold text-yellow-900">
                          {Number(run.conflict_factor).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* ANOVA */}
                    {parsedAnova && parsedAnova.applicable === false ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 h-full flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-amber-900 mb-1">ANOVA not applicable</h4>
                        <p className="text-xs text-amber-800">
                          Not enough departments/staff to test variance for this run. The stress values are still shown.
                        </p>
                      </div>
                    ) : parsedAnova && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-full flex flex-col">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                          ANOVA Test Results
                        </h4>
                        <div className="space-y-2 flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              F-Statistic:
                            </span>
                            <span className="text-sm font-semibold">
                              {parsedAnova.fStatistic?.toFixed(3)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Critical Value:
                            </span>
                            <span className="text-sm font-semibold">
                              {parsedAnova.criticalValue}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`mt-3 p-2 rounded-md text-xs font-bold text-center border ${
                            parsedAnova?.conclusion?.includes("Reject")
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-green-100 text-green-800 border-green-200"
                          }`}
                        >
                          {parsedAnova?.conclusion}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
