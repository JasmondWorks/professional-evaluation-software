"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { apiFetch } from "@/app/utils/apiFetch";
import { BackLink } from "@/app/components/ui";

// Saved maintenance runs, newest first, each with the plan it produced.
//
// The model used to compute and forget. The client asked for the results to be
// saved and viewable with the date of execution, and particularly for the
// planned maintenance dates to be kept, since those are what the maintenance
// group works to.

type Run = {
  id: number;
  facility: string;
  facility_symbol: string | null;
  mtbf: number | null;
  optimal_interval: number | null;
  planned_hours: number | null;
  cycles: number | null;
  days_between: number | null;
  starts_on: string | null;
  schedule: string[];
  results: Record<string, number>;
  created_at: string;
};

export default function MaintenanceHistoryPage() {
  // Arriving from a machine's page shows that machine's runs; arriving from the
  // menu shows all of them, grouped by machine.
  const params = useSearchParams();
  const only = params.get("facility");

  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(
          `/api/maintenance-runs${only ? `?facility=${encodeURIComponent(only)}` : ""}`,
          { method: "GET" },
        );
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Could not load the history.");
        setRuns(Array.isArray(body) ? body : []);
      } catch (err: any) {
        setError(err.message ?? "Could not load the history.");
      } finally {
        setLoading(false);
      }
    })();
  }, [only]);

  // A run belongs to a machine, so the history reads by machine, each one's runs
  // newest first.
  const machines = useMemo(() => {
    const byMachine = new Map<string, Run[]>();
    for (const run of runs) {
      const key = run.facility;
      byMachine.set(key, [...(byMachine.get(key) ?? []), run]);
    }
    return [...byMachine.entries()].map(([facility, list]) => ({
      facility,
      symbol: list.find((r) => r.facility_symbol)?.facility_symbol ?? null,
      runs: list,
    }));
  }, [runs]);

  return (
    <div className="mx-auto w-full p-8">
      <div className="mb-4">
        <BackLink href="/maintenance">Back to Maintenance</BackLink>
      </div>

      <h1 className="text-2xl font-bold text-strong">Maintenance history</h1>
      <p className="mt-1 text-body">
        {only
          ? `Saved runs for ${only}, newest first.`
          : "Every saved computation, by machine, with the preventive plan it produced and the date it was run."}
      </p>

      {loading ? (
        <p className="mt-8 text-muted">Loading the history…</p>
      ) : error ? (
        <p className="mt-8 rounded-lg bg-danger-50 px-4 py-3 text-danger-700">{error}</p>
      ) : runs.length === 0 ? (
        <div className="mt-8 rounded-xl border border-line bg-white p-12 text-center shadow-sm">
          <h3 className="text-lg font-medium text-strong">Nothing saved yet</h3>
          <p className="mt-1 text-muted">
            Run the model on a facility and press “Save result and plan”.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {machines.map((machine) => (
            <div key={machine.facility}>
              <h2 className="mb-3 flex items-baseline gap-2 text-sm font-semibold text-strong">
                {machine.facility}
                {machine.symbol && (
                  <span className="rounded-md border border-line px-2 py-0.5 text-xs font-normal text-muted">
                    {machine.symbol}
                  </span>
                )}
                <span className="text-xs font-normal text-muted">
                  {machine.runs.length} run{machine.runs.length === 1 ? "" : "s"}
                </span>
              </h2>

              <div className="flex flex-col gap-4">
          {machine.runs.map((run) => (
            <section
              key={run.id}
              className="rounded-xl border border-line bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-sm font-semibold text-body">
                  {run.facility_symbol ?? run.facility}
                </h3>
                <span className="text-xs text-muted">
                  Executed {dayjs(run.created_at).format("dddd, MMMM D YYYY • h:mm A")}
                </span>
              </div>

              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-5">
                <div>
                  <dt className="text-xs text-muted">MTBF</dt>
                  <dd className="font-semibold text-strong">
                    {run.mtbf == null
                      ? run.results?.mtbf == null
                        ? "—"
                        : `${Number(run.results.mtbf).toFixed(2)} hrs`
                      : `${run.mtbf.toFixed(2)} hrs`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Optimal interval</dt>
                  <dd className="font-semibold text-strong">
                    {run.optimal_interval == null ? "—" : `${run.optimal_interval.toFixed(2)} hrs`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Planned hours</dt>
                  <dd className="font-semibold text-strong">
                    {run.planned_hours == null ? "—" : `${run.planned_hours.toFixed(2)} hrs`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Cycles</dt>
                  <dd className="font-semibold text-strong">{run.cycles ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Days between</dt>
                  <dd className="font-semibold text-strong">{run.days_between ?? "—"}</dd>
                </div>
              </dl>

              {Array.isArray(run.schedule) && run.schedule.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-muted">Planned maintenance dates</p>
                  <ol className="mt-2 flex flex-wrap gap-2">
                    {run.schedule.map((d, i) => (
                      <li
                        key={d}
                        className="rounded-lg border border-pes-200 bg-pes-50 px-3 py-1.5 text-xs font-medium text-pes"
                      >
                        {i + 1}. {dayjs(d).format("D MMM YYYY")}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>
          ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
