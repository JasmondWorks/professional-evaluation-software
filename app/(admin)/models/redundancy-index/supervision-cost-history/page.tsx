"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import dayjs from "dayjs";

import { apiFetch } from '@/app/utils/apiFetch';
import RemoveRecordButton from "@/app/components/models/RemoveRecordButton";
import { BackLink } from '@/app/components/ui';

interface CostRun {
  id: number;
  Kstar: number | null;
  Dstar: number | null;
  a_ij: number | null;
  a_cost: number | null;
  b_cost: number | null;
  lambda: number | null;
  mu: number | null;
  rho: number | null;
  created_at: string;
}

const fmt = (v: number | null, digits: number) =>
  v === null || !Number.isFinite(v) ? "—" : v.toFixed(digits);

export default function SupervisionCostHistoryPage() {
  const [runs, setRuns] = useState<CostRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const token = getAccessToken();
        if (!token) throw new Error("No token found");

        const res = await apiFetch("/api/supervisionCost", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch history");

        const data = await res.json();
        setRuns(Array.isArray(data) ? data : []);
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
        <BackLink href="/models/redundancy-index?tab=cost" className="mb-4">
          Back to Model
        </BackLink>
        <h1 className="text-2xl font-bold mb-2">Supervision Cost History</h1>
        <p className="text-body">
          Saved runs of the supervision cost function (Eq. 8.35), showing the
          span of control K* that minimised cost for each set of parameters.
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
          <p className="text-muted">You haven&apos;t saved any Supervision Cost results yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-canvas border-b border-line text-body font-medium">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                  <th className="px-6 py-4">K*</th>
                  <th className="px-6 py-4">D* (min cost)</th>
                  <th className="px-6 py-4">λ</th>
                  <th className="px-6 py-4">μ</th>
                  <th className="px-6 py-4">ρ</th>
                  <th className="px-6 py-4 whitespace-nowrap">A / a / b</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-canvas transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-muted">
                      {dayjs(run.created_at).format("MMM D, YYYY h:mm A")}
                    </td>
                    <td className="px-6 py-4 font-bold text-pes text-lg">
                      {run.Kstar ?? "—"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-strong">
                      {fmt(run.Dstar, 4)}
                    </td>
                    <td className="px-6 py-4 text-body">{fmt(run.lambda, 4)}</td>
                    <td className="px-6 py-4 text-body">{fmt(run.mu, 4)}</td>
                    <td className="px-6 py-4 text-body">{fmt(run.rho, 6)}</td>
                    <td className="px-6 py-4 text-muted whitespace-nowrap">
                      {fmt(run.a_ij, 1)} / {fmt(run.a_cost, 2)} / {fmt(run.b_cost, 2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <RemoveRecordButton
                        source="supervision-cost"
                        id={run.id}
                        label={`the run of ${dayjs(run.created_at).format("MMM D, YYYY")}`}
                        historyCount={runs.length}
                        onRemoved={(id) => setRuns((rows) => rows.filter((r) => r.id !== id))}
                      />
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
