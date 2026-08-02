"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft2 } from "iconsax-react";
import HistoryChart from "@/app/components/ui/HistoryChart";
import { apiFetch } from '@/app/utils/apiFetch';

interface AppraisalRun {
  id: number;
  cwh: number;
  cbh: number;
  hd: number;
  oq: number;
  wq: number;
  points: number;
  rtp: number;
  computed_appraisal_max_score: number;
  hod_max_score: number;
  na: number;
  ta: number;
  wasted_man_hours: number;
  wasted_cost: number;
  pidle: number;
  lost_hours: number;
  lost_cost: number;
  total_wasted_cost: number;
  created_at: string;
}

export default function StaffAppraisalHistory() {
  const [history, setHistory] = useState<AppraisalRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await apiFetch("/api/getStaffAppraisal", {
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
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link
            href="/models/appraisal"
            className="inline-flex items-center text-sm text-muted hover:text-pes transition-colors mb-2"
          >
            <ArrowLeft2 size="16" className="mr-1" /> Back to Staff Appraisal Model
          </Link>
          <h1 className="text-2xl font-bold text-strong">Staff Appraisal History</h1>
          <p className="text-muted text-sm mt-1">
            Review past calculations for appraisal, overloading, and underloading costs.
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
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
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
          <p className="text-muted">Run the Staff Appraisal model and save results to see them here.</p>
        </div>
      ) : (
        <>
          <HistoryChart 
            data={history.map(r => ({ ...r, total_cost: r.cwh + r.cbh + r.hd + r.oq }))} 
            dataKey="total_cost" 
            name="Total Wasted Cost (₦)" 
            color="#ef4444" 
            formatter={(val) => `₦${val.toLocaleString()}`} 
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
                <div className="text-sm font-semibold px-3 py-1 rounded-full bg-red-100 text-red-800">
                  Wasted Cost: {Number(run.total_wasted_cost).toFixed(2)}
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-indigo-900 mb-3 border-b border-indigo-200 pb-2">Appraisal Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-indigo-700">OQ / WQ</span>
                      <span className="text-sm font-medium">{Number(run.oq)} / {Number(run.wq)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-indigo-700">Points</span>
                      <span className="text-sm font-medium">{Number(run.points)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-indigo-100">
                      <span className="text-xs text-indigo-800 font-semibold">Max Score</span>
                      <span className="text-sm font-bold text-indigo-900">{Number(run.computed_appraisal_max_score).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-900 mb-3 border-b border-red-200 pb-2">Unit Overloading</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-red-700">Wait Cases / Time</span>
                      <span className="text-sm font-medium">{Number(run.na)} / {Number(run.ta)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-red-700">Wasted Hours</span>
                      <span className="text-sm font-medium">{Number(run.wasted_man_hours).toFixed(2)}h</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-red-100">
                      <span className="text-xs text-red-800 font-semibold">Cost (Cwh: {Number(run.cwh)})</span>
                      <span className="text-sm font-bold text-red-900">{Number(run.wasted_cost).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-3 border-b border-yellow-200 pb-2">Boss Underloading</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-yellow-700">Idle Proportion</span>
                      <span className="text-sm font-medium">{Number(run.pidle)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-yellow-700">Lost Hours</span>
                      <span className="text-sm font-medium">{Number(run.lost_hours).toFixed(2)}h</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-yellow-100">
                      <span className="text-xs text-yellow-800 font-semibold">Cost (Cbh: {Number(run.cbh)})</span>
                      <span className="text-sm font-bold text-yellow-900">{Number(run.lost_cost).toFixed(2)}</span>
                    </div>
                  </div>
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
