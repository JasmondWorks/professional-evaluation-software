"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import dayjs from "dayjs";

import HistoryChart from "@/app/components/ui/HistoryChart";
import { apiFetch } from '@/app/utils/apiFetch';
import { BackLink } from '@/app/components/ui';

interface MotivationRun {
  id: number;
  total_score: number;
  rating: string;
  created_at: string;
  categories: any[];
}

export default function MotivationHistory() {
  const [history, setHistory] = useState<MotivationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await apiFetch("/api/getMotivation", {
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
          <BackLink href="/models/motivation" className="mb-2">Back to Motivation Model</BackLink>
          <h1 className="text-2xl font-bold text-strong">Motivation History</h1>
          <p className="text-muted text-sm mt-1">
            Review past motivation evaluations.
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
          <p className="text-muted">Run the Motivation model and save results to see them here.</p>
        </div>
      ) : (
        <>
          <HistoryChart 
            data={history} 
            dataKey="total_score" 
            name="Overall Motivation Score" 
            color="#16a34a" 
            formatter={(val) => `${val.toFixed(1)}%`} 
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
                  run.rating.includes("High") ? "bg-green-100 text-green-800" :
                  run.rating.includes("Moderate") ? "bg-yellow-100 text-yellow-800" :
                  "bg-danger-100 text-danger-700"
                }`}>
                  {run.rating}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted font-medium">Total Score</p>
                    <p className="text-3xl font-bold text-strong">{run.total_score}</p>
                  </div>
                </div>

                {run.categories && run.categories.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-body mb-3 uppercase tracking-wider">Category Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {run.categories.map((cat: any, i: number) => {
                        const catScore = cat.subItems.reduce((sum: number, s: any) => sum + s.score, 0);
                        const weightedScore = catScore * cat.weight;
                        return (
                          <div key={i} className="bg-canvas rounded-lg p-3 border border-line">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-medium text-strong">{cat.name}</span>
                              <span className="text-xs font-semibold text-muted">Wt: {cat.weight}</span>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                              <div>
                                <span className="text-xs text-muted block">Raw Score: {catScore}</span>
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
