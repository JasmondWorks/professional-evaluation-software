"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft2 } from "iconsax-react";
import { apiFetch } from '@/app/utils/apiFetch';

interface OptimizationResultRun {
  id: number;
  optimalK: number;
  totalStaffNeeded: number;
  supervisoryStaff: number;
  managementLevel1: number;
  managementLevel2: number;
  topManagementStaff: number;
  lecturers: number;
  seniorLecturers: number;
  professors: number;
  efficiencyValue: number;
  createdAt: string;
}

export default function RobustHistoryPage() {
  const [runs, setRuns] = useState<OptimizationResultRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const token = getAccessToken();
        if (!token) throw new Error("No token found");

        const res = await apiFetch("/api/results?mode=robust", {
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
          href="/models/student-teacher/robust"
          className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors mb-4"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Robust Model
        </Link>
        <h1 className="text-2xl font-bold mb-2">Robust Optimization History</h1>
        <p className="text-gray-600">
          Historical records of your robust student-teacher ratio calculations.
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      ) : runs.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No history found</h3>
          <p className="text-gray-500">You haven't saved any Robust Optimization results yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 text-center">Optimal K</th>
                  <th className="px-6 py-4 text-center">Total Staff</th>
                  <th className="px-6 py-4 text-center">Efficiency</th>
                  <th className="px-6 py-4">Distribution (L / SL / P)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {dayjs(run.createdAt).format("MMM D, YYYY h:mm A")}
                    </td>
                    <td className="px-6 py-4 font-bold text-pes text-center text-lg">
                      {run.optimalK}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 text-center">
                      {run.totalStaffNeeded}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-center">
                      {Number(run.efficiencyValue).toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {run.lecturers} / {run.seniorLecturers} / {run.professors}
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
