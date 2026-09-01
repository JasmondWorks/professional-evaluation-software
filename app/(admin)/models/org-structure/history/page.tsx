"use client";

import { useEffect, useMemo, useState } from "react";
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

  // Sections 18, 19 and 21 are saved in the same breath, so the history holds
  // several rows per execution. Listed flat across a grid they read as
  // scattered, which is what the client reported. They are grouped back into
  // the execution they came from, newest first, and each group is headed with
  // the date and time it was run.
  const executions = useMemo(() => {
    const byRun = new Map<string, OrgStructureRun[]>();
    const ordered = [...history].sort((a, b) => {
      const t = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return t !== 0 ? t : b.id - a.id;
    });
    for (const run of ordered) {
      // To the minute: three rows written by one Save share a timestamp to the
      // second, but a slow save can straddle one.
      const key = dayjs(run.created_at).format("YYYY-MM-DD HH:mm");
      byRun.set(key, [...(byRun.get(key) ?? []), run]);
    }
    return [...byRun.entries()].map(([key, runs]) => ({
      key,
      when: runs[0].created_at,
      // Section order within an execution, so 17 reads before 21.
      runs: [...runs].sort((a, b) => a.section - b.section),
    }));
  }, [history]);
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
          {executions.map((execution) => (
            <section key={execution.key} className="mb-8">
              <h2 className="mb-3 flex items-baseline gap-3 text-sm font-semibold text-strong">
                {dayjs(execution.when).format("dddd, MMMM D YYYY • h:mm A")}
                <span className="text-xs font-normal text-muted">
                  {execution.runs.length} section
                  {execution.runs.length === 1 ? "" : "s"} saved
                </span>
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {execution.runs.map((run) => (
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

                {/* The ladder, drawn as it is on the model page. This used to
                    print the numerator and denominator arrays and a raw JSON
                    dump of the extra parameters, which the client could not
                    read — and which was the only record of a run once the
                    table on the model page had been navigated away from. */}
                {Array.isArray(run.extra_data?.levels) && run.extra_data.levels.length > 0 ? (
                  <div className="mt-auto overflow-x-auto rounded-lg border border-line">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-line bg-canvas font-medium text-body">
                        <tr>
                          <th className="px-2 py-1.5">Level</th>
                          <th className="px-2 py-1.5">Numerator</th>
                          <th className="px-2 py-1.5">λ</th>
                          <th className="px-2 py-1.5">μ</th>
                          <th className="px-2 py-1.5">K*</th>
                          <th className="px-2 py-1.5">No-n</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {run.extra_data.levels.map((l: any) => (
                          <tr key={l.level}>
                            <td className="px-2 py-1.5 font-medium text-strong">{l.level}</td>
                            <td className="px-2 py-1.5">{l.numerator}</td>
                            <td className="px-2 py-1.5 text-muted">
                              {l.lambda == null ? "—" : Number(l.lambda).toFixed(4)}
                            </td>
                            <td className="px-2 py-1.5 text-muted">
                              {l.mu == null ? "—" : Number(l.mu).toFixed(4)}
                            </td>
                            <td className="px-2 py-1.5">{l.kstar}</td>
                            <td className="px-2 py-1.5 font-bold text-pes">{l.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(run.extra_data.staffNumber != null ||
                      run.extra_data.supervisoryKstar != null) && (
                      <p className="border-t border-line bg-canvas px-2 py-1.5 text-xs text-muted">
                        Staff number {run.extra_data.staffNumber ?? "—"} ÷ supervisory K*{" "}
                        {run.extra_data.supervisoryKstar ?? "—"}
                        {run.extra_data.method ? ` · ${run.extra_data.method}` : ""}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Runs saved before the ladder was recorded. The counts and
                     spans are all they have, so they are shown as a table of
                     their own rather than as two comma-separated lines. */
                  <div className="mt-auto overflow-x-auto rounded-lg border border-line">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-line bg-canvas font-medium text-body">
                        <tr>
                          <th className="px-2 py-1.5">Level</th>
                          <th className="px-2 py-1.5">
                            {run.section === 21 ? "Real" : "No-n"}
                          </th>
                          <th className="px-2 py-1.5">
                            {run.section === 21 ? "Ideal" : "K*"}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {(run.numerator ?? []).map((n: number, i: number) => (
                          <tr key={i}>
                            <td className="px-2 py-1.5 font-medium text-strong">{i + 1}</td>
                            <td className="px-2 py-1.5 font-bold text-pes">{n}</td>
                            <td className="px-2 py-1.5">{run.denominator?.[i] ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
