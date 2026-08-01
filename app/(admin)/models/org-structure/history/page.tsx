"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft2 } from "iconsax-react";
import HistoryChart from "@/app/components/ui/HistoryChart";
import { apiFetch } from '@/app/utils/apiFetch';

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
      case 18: return "bg-blue-100 text-blue-800";
      case 19: return "bg-indigo-100 text-indigo-800";
      case 20: return "bg-emerald-100 text-emerald-800";
      case 21: return "bg-yellow-100 text-yellow-800";
      case 22: return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link
            href="/models/org-structure"
            className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors mb-2"
          >
            <ArrowLeft2 size="16" className="mr-1" /> Back to Org Structure Models
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Org Structure History</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review past calculations for organizational design and structure models.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Refreshing…" : "Refresh Data"}
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
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No history found</h3>
          <p className="text-gray-500">Run the Org Structure models and save results to see them here.</p>
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
            <div key={run.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">
                  {dayjs(run.created_at).format("MMM D, YYYY • h:mm A")}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${getResultColor(run.section)}`}>
                  {getSectionName(run.section)}
                </span>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Calculated Result</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Number(run.result).toFixed(2)}
                    {run.section === 21 && "%"}
                  </p>
                </div>

                <div className="mt-auto space-y-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  {run.numerator && run.numerator.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Inputs / Numerators:</p>
                      <p className="text-sm font-medium text-gray-800 break-words">{run.numerator.join(", ")}</p>
                    </div>
                  )}
                  {run.denominator && run.denominator.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500">Denominators:</p>
                      <p className="text-sm font-medium text-gray-800 break-words">{run.denominator.join(", ")}</p>
                    </div>
                  )}
                  {run.extra_data && Object.keys(run.extra_data).length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500">Extra Parameters:</p>
                      <pre className="text-xs font-medium text-gray-800 whitespace-pre-wrap">{JSON.stringify(run.extra_data, null, 2)}</pre>
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
