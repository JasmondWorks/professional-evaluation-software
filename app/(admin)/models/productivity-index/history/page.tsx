"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import dayjs from "dayjs";

import { apiFetch } from '@/app/utils/apiFetch';
import RemoveRecordButton from "@/app/components/models/RemoveRecordButton";
import { BackLink } from '@/app/components/ui';

interface IndexRun {
  id: number;
  productivity: number;
  // The two figures the index was computed from. Kept alongside the result
  // because the future-output prediction fits a line through output against
  // index, and cannot do that from the index alone.
  output_resources: number | null;
  input_resources: number | null;
  created_at: string;
}

export default function ProductivityHistoryPage() {
  const [runs, setRuns] = useState<IndexRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const token = getAccessToken();
        if (!token) throw new Error("No token found");

        const res = await apiFetch("/api/getPersonnelIndex?type=productivity", {
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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pes border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full mx-auto">
      <div className="mb-8">
        <BackLink href="/models/productivity-index" className="mb-4">Back to Model</BackLink>
        <h1 className="text-2xl font-bold mb-2">Productivity Index History</h1>
        <p className="text-body">
          Historical records of your productivity index calculations.
        </p>
      </div>

      {error ? (
        <div className="bg-danger-50 text-danger-600 p-4 rounded-md">{error}</div>
      ) : runs.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-strong mb-1">No history found</h3>
          <p className="text-muted">You haven't saved any Productivity Index results yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-canvas border-b border-line text-body font-medium">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                  <th className="px-6 py-4">Productivity Index</th>
                  <th className="px-6 py-4 whitespace-nowrap">Output resources (un-inflated)</th>
                  <th className="px-6 py-4 whitespace-nowrap">Input resources (un-inflated)</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-canvas transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-muted">
                      {dayjs(run.created_at).format("MMM D, YYYY h:mm A")}
                    </td>
                    <td className="px-6 py-4 font-bold text-pes text-lg">
                      {Number(run.productivity).toFixed(3)}
                    </td>
                    <td className="px-6 py-4 text-body">
                      {run.output_resources == null
                        ? "—"
                        : Number(run.output_resources).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                    </td>
                    <td className="px-6 py-4 text-body">
                      {run.input_resources == null
                        ? "—"
                        : Number(run.input_resources).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-pes-50 text-pes-700 border-blue-200">
                          Recorded
                        </span>
                        <RemoveRecordButton
                          source="index"
                          id={run.id}
                          label={`the run of ${dayjs(run.created_at).format("MMM D, YYYY")}`}
                          onRemoved={(id) => setRuns((rows) => rows.filter((r) => r.id !== id))}
                        />
                      </div>
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
