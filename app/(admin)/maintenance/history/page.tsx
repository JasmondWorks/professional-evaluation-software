"use client";

import { useEffect, useState } from "react";
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
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/maintenance-runs", { method: "GET" });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Could not load the history.");
        setRuns(Array.isArray(body) ? body : []);
      } catch (err: any) {
        setError(err.message ?? "Could not load the history.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto w-full p-8">
      <div className="mb-4">
        <BackLink href="/maintenance">Back to Maintenance</BackLink>
      </div>

      <h1 className="text-2xl font-bold text-strong">Maintenance history</h1>
      <p className="mt-1 text-body">
        Every saved computation, with the preventive plan it produced and the date it was
        run.
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
        <div className="mt-8 flex flex-col gap-4">
          {runs.map((run) => (
            <section
              key={run.id}
              className="rounded-xl border border-line bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-base font-bold text-strong">{run.facility}</h2>
                <span className="text-xs text-muted">
                  Executed {dayjs(run.created_at).format("dddd, MMMM D YYYY • h:mm A")}
                </span>
              </div>

              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-4">
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
      )}
    </div>
  );
}
