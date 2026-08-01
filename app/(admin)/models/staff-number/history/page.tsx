"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft2 } from "iconsax-react";
import { apiFetch } from '@/app/utils/apiFetch';

interface StaffEstimationRun {
  id: number;
  methodType: string;
  staffNeeded: number;
  createdAt: string;
  // Method 1
  basicTime?: number;
  relaxAllowance?: number;
  loadFactor?: number;
  numTasks?: number;
  timePerTask?: number;
  availableHoursPerPerson?: number;
  // Method 2
  observedTime?: number;
  estimatedTime?: number;
  correctiveFactor?: number;
  personsEstimate?: number;
  // Method 3
  A?: number;
  B?: number;
  confidenceLimit?: number;
  utilizationFactor?: number;
  annualManHours?: number;
  standardManHours?: number;
}

export default function StaffEstimationHistoryPage() {
  const [runs, setRuns] = useState<StaffEstimationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const token = getAccessToken();
        if (!token) throw new Error("No token found");

        const res = await apiFetch("/api/getStaffEstimation", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pes"></div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full mx-auto">
      <div className="mb-8">
        <Link
          href="/models/staff-number"
          className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors mb-4"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Staff Number Model
        </Link>
        <h1 className="text-2xl font-bold mb-2">Staff Estimation History</h1>
        <p className="text-gray-600">
          Historical records of your staff number estimations across all three methods.
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      ) : runs.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No history found</h3>
          <p className="text-gray-500">You haven't saved any Staff Estimation results yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                  <th className="px-6 py-4">Method Used</th>
                  <th className="px-6 py-4">Parameters (Brief)</th>
                  <th className="px-6 py-4 text-right">Staff Needed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {dayjs(run.createdAt).format("MMM D, YYYY h:mm A")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                        {run.methodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-xs">
                      {run.methodType === "Method1" && `Basic Time: ${run.basicTime}, Tasks: ${run.numTasks}`}
                      {run.methodType === "Method2" && `Observed: ${run.observedTime}, Tasks: ${run.numTasks}`}
                      {run.methodType === "Method3" && `A: ${run.A}, B: ${run.B}, Confidence: ${run.confidenceLimit}%`}
                      {run.methodType === "Work Sampling" && `Available Hours: ${run.availableHoursPerPerson}, Use Factor: ${run.utilizationFactor}`}
                    </td>
                    <td className="px-6 py-4 font-bold text-pes text-right">
                      {run.staffNeeded}
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
