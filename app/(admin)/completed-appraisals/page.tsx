"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "iconsax-react";
import { getAccessToken } from "@/app/utils/auth";
import { apiFetch } from '@/app/utils/apiFetch';

type Appraisal = {
  id: number;
  pesuser_name: string;
  dept: string | null;
  teaching_quality_evaluation: number | string | null;
  research_quality_evaluation: number | string | null;
  administrative_quality_evaluation: number | string | null;
  community_quality_evaluation: number | string | null;
};

const num = (v: number | string | null) => (v == null ? null : Number(v));
const fmt = (v: number | string | null) => {
  const n = num(v);
  return n == null || isNaN(n) ? "—" : n.toFixed(2);
};

function average(a: Appraisal): string {
  const vals = [
    a.teaching_quality_evaluation,
    a.research_quality_evaluation,
    a.administrative_quality_evaluation,
    a.community_quality_evaluation,
  ]
    .map(num)
    .filter((n): n is number => n != null && !isNaN(n));
  if (vals.length === 0) return "—";
  return (vals.reduce((s, n) => s + n, 0) / vals.length).toFixed(2);
}

export default function CompletedAppraisalsPage() {
  const [rows, setRows] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setError("Please log in to view completed appraisals.");
      setLoading(false);
      return;
    }
    apiFetch("/api/getCompletedAppraisals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRows(data);
        else setError(data?.error || "Failed to load completed appraisals.");
      })
      .catch(() => setError("Failed to load completed appraisals."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="w-full min-h-screen bg-canvas p-6 md:p-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-pes transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-line">
          <h1 className="text-2xl font-semibold text-strong">
            Completed Appraisals
          </h1>
          {!loading && !error && (
            <span className="text-sm text-muted">
              {rows.length} record{rows.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-muted">
            <p className="font-medium">No completed appraisals yet.</p>
            <p className="text-sm mt-1">
              Appraisals appear here once they’ve been submitted and accepted.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted bg-canvas">
                  <th className="px-6 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium text-right">Teaching</th>
                  <th className="px-4 py-3 font-medium text-right">Research</th>
                  <th className="px-4 py-3 font-medium text-right">Admin</th>
                  <th className="px-4 py-3 font-medium text-right">Community</th>
                  <th className="px-6 py-3 font-medium text-right">Average</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-t border-line hover:bg-canvas">
                    <td className="px-6 py-3 font-medium text-strong">{a.pesuser_name}</td>
                    <td className="px-4 py-3 text-body">{a.dept || "—"}</td>
                    <td className="px-4 py-3 text-right text-body">{fmt(a.teaching_quality_evaluation)}</td>
                    <td className="px-4 py-3 text-right text-body">{fmt(a.research_quality_evaluation)}</td>
                    <td className="px-4 py-3 text-right text-body">{fmt(a.administrative_quality_evaluation)}</td>
                    <td className="px-4 py-3 text-right text-body">{fmt(a.community_quality_evaluation)}</td>
                    <td className="px-6 py-3 text-right font-semibold text-pes">{average(a)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
