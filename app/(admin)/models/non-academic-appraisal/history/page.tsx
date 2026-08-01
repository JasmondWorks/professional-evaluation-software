"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft2 } from "iconsax-react";
import { apiFetch } from '@/app/utils/apiFetch';

interface AppraisalRun {
  id: number;
  output: number;
  quality: number;
  efficiency: number;
  attendance: number;
  teamwork: number;
  total_score: number;
  rating: string;
  created_at: string;
}

export default function NonAcademicAppraisalHistory() {
  const [history, setHistory] = useState<AppraisalRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await apiFetch("/api/getNonAcademicAppraisal", {
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
            href="/models/non-academic-appraisal"
            className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors mb-2"
          >
            <ArrowLeft2 size="16" className="mr-1" /> Back to Appraisal Model
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Appraisal History</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review past evaluations for non-academic staff.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
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
          <p className="text-gray-500">Run the Non-Academic Appraisal model and save results to see them here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {history.map((run) => (
            <div key={run.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    ID: {run.id}
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {dayjs(run.created_at).format("MMM D, YYYY • h:mm A")}
                  </span>
                </div>
                <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  run.rating.includes("Excellent") ? "bg-green-100 text-green-800" :
                  run.rating.includes("Good") ? "bg-blue-100 text-blue-800" :
                  run.rating.includes("Average") ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {run.rating}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Score</p>
                    <p className="text-3xl font-bold text-gray-900">{Number(run.total_score).toFixed(2)}</p>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Metrics Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 mb-1">Output Quantity</p>
                    <p className="text-lg font-bold text-gray-800">{Number(run.output).toFixed(1)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 mb-1">Quality of Work</p>
                    <p className="text-lg font-bold text-gray-800">{Number(run.quality).toFixed(1)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 mb-1">Efficiency</p>
                    <p className="text-lg font-bold text-gray-800">{Number(run.efficiency).toFixed(1)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 mb-1">Attendance</p>
                    <p className="text-lg font-bold text-gray-800">{Number(run.attendance).toFixed(1)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 mb-1">Teamwork</p>
                    <p className="text-lg font-bold text-gray-800">{Number(run.teamwork).toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
