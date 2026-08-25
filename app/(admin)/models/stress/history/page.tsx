"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import dayjs from "dayjs";

import HistoryChart from "@/app/components/ui/HistoryChart";
import { apiFetch } from '@/app/utils/apiFetch';
import { BackLink } from '@/app/components/ui';

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
          <BackLink href="/models/stress" className="mb-2">Back to Stress Evaluation
            Model</BackLink>
          <h1 className="text-2xl font-bold text-strong">
            Stress Evaluation History
          </h1>
          <p className="text-muted text-sm mt-1">
            Review past organizational stress evaluations and ANOVA results.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          disabled={refreshing}
          className="px-4 py-2 bg-white border border-line rounded-md text-sm font-medium hover:bg-canvas transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
        >
          {refreshing && (
            <span className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full" />
          )}
          {refreshing ? "Refreshing…" : "Refresh Data"}
        </button>
      </div>

      {error && (
        <div className="bg-danger-50 text-danger-600 p-4 rounded-md mb-6 border border-danger-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-line p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-pes border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted">Loading history data...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-line p-12 text-center">
          <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-muted"
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
          <h3 className="text-lg font-medium text-strong mb-1">
            No history found
          </h3>
          <p className="text-muted">
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
                  className="bg-white rounded-xl shadow-sm border border-line overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-line bg-canvas flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-pes-100 text-pes-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        ID: {run.id}
                      </div>
                      <span className="text-sm font-medium text-body">
                        {dayjs(run.created_at).format("MMM D, YYYY • h:mm A")}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Aggregates */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-danger-50 border border-danger-100 rounded-lg p-4 flex flex-col justify-center items-center text-center h-full">
                        <span className="text-xs font-semibold text-danger-700 uppercase tracking-wider mb-2">
                          Stress
                        </span>
                        <span className="text-2xl font-bold text-danger-700">
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
                      <div className="bg-warning-50 border border-warning-100 rounded-lg p-4 h-full flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-warning-700 mb-1">ANOVA not applicable</h4>
                        <p className="text-xs text-warning-700">
                          Not enough departments/staff to test variance for this run. The stress values are still shown.
                        </p>
                      </div>
                    ) : parsedAnova && (
                      <div className="bg-canvas border border-line rounded-lg p-4 h-full flex flex-col">
                        <h4 className="text-sm font-bold text-strong mb-3 border-b border-line pb-2">
                          ANOVA Test Results
                        </h4>
                        <div className="space-y-2 flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-body">
                              F-Statistic:
                            </span>
                            <span className="text-sm font-semibold">
                              {parsedAnova.fStatistic?.toFixed(3)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-body">
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
                              ? "bg-danger-100 text-danger-700 border-danger-100"
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
