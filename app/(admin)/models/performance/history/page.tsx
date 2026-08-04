"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft2 } from "iconsax-react";
import HistoryChart from "@/app/components/ui/HistoryChart";
import { apiFetch } from '@/app/utils/apiFetch';

interface PerformanceRun {
  id: number;
  total_score: number;
  rating: string;
  criteria: any;
  thresholds: any;
  created_at: string;
}

export default function PerformanceHistory() {
  const [history, setHistory] = useState<PerformanceRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await apiFetch("/api/getPerformanceResult", {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data);
    } catch (err: any) {
      console.error(err);
      setError("Error loading history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link
            href="/models/performance"
            className="inline-flex items-center text-sm text-muted hover:text-pes transition-colors mb-2"
          >
            <ArrowLeft2 size="16" className="mr-1" /> Back to Performance Model
          </Link>
          <h1 className="text-2xl font-bold text-strong">Performance History</h1>
          <p className="text-muted text-sm mt-1">
            Review past staff performance evaluations.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-white border border-line rounded-md text-sm font-medium hover:bg-canvas transition-colors shadow-sm"
        >
          Refresh Data
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
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-strong mb-1">No history found</h3>
          <p className="text-muted">Run the Performance model and save results to see them here.</p>
        </div>
      ) : (
        <>
          <HistoryChart 
            data={history} 
            dataKey="total_score" 
            name="Overall Performance Score" 
            color="#3b82f6" 
            formatter={(val) => `${val.toFixed(1)}`} 
          />
          <div className="grid gap-6">
          {history.map((run) => (
            <div key={run.id} className="bg-white rounded-xl shadow-sm border border-line overflow-hidden">
              <div className="px-6 py-4 border-b border-line bg-canvas flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-pes-100 text-pes-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    ID: {run.id}
                  </div>
                  <span className="text-sm font-medium text-body">
                    {dayjs(run.created_at).format("MMM D, YYYY • h:mm A")}
                  </span>
                </div>
                <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  run.rating.includes("Excellent") ? "bg-green-100 text-green-800" :
                  run.rating.includes("Good") ? "bg-pes-100 text-pes-700" :
                  run.rating.includes("Average") ? "bg-yellow-100 text-yellow-800" :
                  "bg-danger-100 text-danger-700"
                }`}>
                  {run.rating}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted font-medium">Total Score</p>
                    <p className="text-3xl font-bold text-strong">{Number(run.total_score).toFixed(2)}</p>
                  </div>
                </div>

                {run.criteria && run.criteria.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-body mb-3 uppercase tracking-wider">Criteria Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {run.criteria.map((cat: any, i: number) => {
                        const catScore = cat.scores.length > 0 ? cat.scores.reduce((sum: number, s: any) => sum + s, 0) / cat.scores.length : 0;
                        const weightedScore = catScore * cat.weight;
                        return (
                          <div key={i} className="bg-canvas rounded-lg p-3 border border-line flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-strong">{cat.name}</span>
                              <span className="text-xs font-semibold text-muted">Wt: {cat.weight}</span>
                            </div>
                            <div className="flex items-end justify-between mt-auto">
                              <div>
                                <span className="text-xs text-muted block mb-1">Raw Avg: {catScore.toFixed(2)}</span>
                                <span className="text-sm font-bold text-pes">+{weightedScore.toFixed(2)} pts</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  );
}
