"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import dayjs from "dayjs";

import HistoryChart from "@/app/components/ui/HistoryChart";
import { apiFetch } from '@/app/utils/apiFetch';
import { BackLink } from '@/app/components/ui';

interface OrgStructureRun {
  id: number;
  section: number;
  result: number;
  numerator: number[];
  denominator: number[];
  extra_data: any;
  created_at: string;
}

export default function OrgStructureHistory() {
  const [history, setHistory] = useState<OrgStructureRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    // Reset loading/error on every run so Refresh gives visible feedback
    // (previously loading was only ever set false, so clicking did nothing visible).
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/getOrgStructure", {
        // avoid any cached response so Refresh always fetches fresh rows
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError("Error loading history.");
    } finally {
      setLoading(false);
    }
  };

  const getSectionName = (sectionId: number) => {
    switch (sectionId) {
      case 18: return "18. Org. Structure Size (S)";
      case 19: return "19. Shape of Structure (E)";
      case 20: return "20. Organizational Design (Min/Max)";
      case 21: return "21. Percentage Redundancy (PR%)";
      case 22: return "22. Future Requirements";
      default: return `Section ${sectionId}`;
    }
  };

  const getResultColor = (sectionId: number) => {
    switch (sectionId) {
      case 18: return "bg-pes-100 text-pes-700";
      case 19: return "bg-pes-100 text-pes-700";
      case 20: return "bg-emerald-100 text-emerald-800";
      case 21: return "bg-yellow-100 text-yellow-800";
      case 22: return "bg-purple-100 text-purple-800";
      default: return "bg-canvas text-strong";
    }
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <BackLink href="/models/org-structure" className="mb-2">Back to Org Structure Models</BackLink>
          <h1 className="text-2xl font-bold text-strong">Org Structure History</h1>
          <p className="text-muted text-sm mt-1">
            Review past calculations for organizational design and structure models.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-4 py-2 bg-white border border-line rounded-md text-sm font-medium hover:bg-canvas transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Refreshing…" : "Refresh Data"}
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
          <p className="text-muted">Run the Org Structure models and save results to see them here.</p>
        </div>
      ) : (
        <>
          <HistoryChart 
            data={history} 
            dataKey="result" 
            name="Computed Result" 
            color="#f59e0b" 
            formatter={(val) => `${val.toFixed(2)}`} 
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {history.map((run) => (
            <div key={run.id} className="bg-white rounded-xl shadow-sm border border-line overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-line bg-canvas flex justify-between items-center">
                <span className="text-xs font-medium text-muted">
                  {dayjs(run.created_at).format("MMM D, YYYY • h:mm A")}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${getResultColor(run.section)}`}>
                  {getSectionName(run.section)}
                </span>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Calculated Result</p>
                  <p className="text-3xl font-bold text-strong">
                    {Number(run.result).toFixed(2)}
                    {run.section === 21 && "%"}
                  </p>
                </div>

                <div className="mt-auto space-y-2 bg-canvas rounded-lg p-3 border border-line">
                  {run.numerator && run.numerator.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted">Inputs / Numerators:</p>
                      <p className="text-sm font-medium text-strong break-words">{run.numerator.join(", ")}</p>
                    </div>
                  )}
                  {run.denominator && run.denominator.length > 0 && (
                    <div className="pt-2 border-t border-line">
                      <p className="text-xs font-semibold text-muted">Denominators:</p>
                      <p className="text-sm font-medium text-strong break-words">{run.denominator.join(", ")}</p>
                    </div>
                  )}
                  {run.extra_data && Object.keys(run.extra_data).length > 0 && (
                    <div className="pt-2 border-t border-line">
                      <p className="text-xs font-semibold text-muted">Extra Parameters:</p>
                      <pre className="text-xs font-medium text-strong whitespace-pre-wrap">{JSON.stringify(run.extra_data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  );
}
