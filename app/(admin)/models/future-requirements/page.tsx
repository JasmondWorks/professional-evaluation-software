"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BackLink, PageHeader } from "@/app/components/ui";
import InfoPopover from "@/app/components/ui/InfoPopover";
import { apiFetch } from "@/app/utils/apiFetch";
import { fitLine, predict, type Point } from "@/app/lib/models/regression";

// Future requirements.
//
// This was section 22 of the organization structure model, where it sat as three
// bare fields — a, b and x — that somebody had to work out elsewhere and type
// in. The client asked for it as a model of its own, reading the values from the
// histories the other models already record.
//
// All three predictions are the same arithmetic on different pairs: fit
// y = a + bx through the stored runs, then evaluate the line at an x that has
// not happened yet. What changes between them is only which two columns of which
// history become x and y.

type Series = {
  key: string;
  label: string;
  /** What the operator is trying to find out, in their words. */
  question: string;
  xLabel: string;
  yLabel: string;
  /** Read the pairs out of whatever the history endpoint returns. */
  load: () => Promise<Point[]>;
  /** How to describe the answer once the line has been evaluated. */
  answer: (y: number, x: number) => string;
};

async function studentTeacherRuns(): Promise<any[]> {
  const res = await apiFetch("/api/getStudentTeacherRatio", { method: "GET" });
  if (!res.ok) throw new Error("Could not load the student/teacher history.");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.data ?? []);
}

const SERIES: Series[] = [
  {
    key: "student-teacher",
    label: "Student / teacher",
    question:
      "Given a student-to-teacher ratio K*, how many teachers does that imply — and so how many students can be carried?",
    xLabel: "K* (student / teacher ratio)",
    yLabel: "Teachers",
    load: async () => {
      const runs = await studentTeacherRuns();
      return runs
        .map((r) => ({
          x: Number(r.optimalK),
          // "Teachers" is every teaching grade together, which is what the
          // ratio is measured against.
          y:
            Number(r.lecturers ?? 0) +
            Number(r.seniorLecturers ?? 0) +
            Number(r.professors ?? 0),
        }))
        .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && p.y > 0);
    },
    answer: (y, x) =>
      `${y.toFixed(0)} teachers, carrying about ${(y * x).toFixed(0)} students at a ratio of ${x}.`,
  },
  {
    key: "staff-number",
    label: "Staff number",
    question:
      "Given a K* from personnel utilization, what total staff number — supervisory through management — does the organization need?",
    xLabel: "K* (optimal span of control)",
    yLabel: "Total staff (supervisory → management)",
    load: async () => {
      const runs = await studentTeacherRuns();
      return runs
        .map((r) => ({
          x: Number(r.optimalK),
          y:
            Number(r.supervisoryStaff ?? 0) +
            Number(r.managementLevel1 ?? 0) +
            Number(r.managementLevel2 ?? 0) +
            Number(r.topManagement ?? 0),
        }))
        .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && p.y > 0);
    },
    answer: (y) => `${y.toFixed(0)} staff in total, supervisory through management.`,
  },
  {
    key: "productivity",
    label: "Production output",
    question:
      "Given a productivity index, what un-inflated output should the organization expect to produce?",
    xLabel: "Productivity index",
    yLabel: "Output resources (un-inflated)",
    load: async () => {
      const res = await apiFetch("/api/getPersonnelIndex?type=productivity", {
        method: "GET",
      });
      if (!res.ok) throw new Error("Could not load the productivity history.");
      const runs = await res.json();
      return (Array.isArray(runs) ? runs : [])
        .map((r: any) => ({
          x: Number(r.productivity),
          y: Number(r.output_resources),
        }))
        .filter((p: Point) => Number.isFinite(p.x) && Number.isFinite(p.y));
    },
    answer: (y) =>
      `${y.toLocaleString(undefined, { maximumFractionDigits: 2 })} in un-inflated output resources.`,
  },
];

export default function FutureRequirementsPage() {
  const [seriesKey, setSeriesKey] = useState(SERIES[0].key);
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [x, setX] = useState<number | "">("");

  const series = SERIES.find((s) => s.key === seriesKey)!;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setPoints([]);
    setX("");
    series
      .load()
      .then((p) => {
        if (!cancelled) setPoints(p);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Could not load the history.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [seriesKey]);

  const fit = useMemo(() => fitLine(points), [points]);

  // The scatter and the fitted line share one x axis, so they are drawn from a
  // single dataset with two y keys rather than two charts overlaid.
  const chartData = useMemo(() => {
    if (!fit) return [];
    return fit.points
      .slice()
      .sort((p, q) => p.x - q.x)
      .map((p) => ({ x: p.x, observed: p.y, fitted: predict(fit, p.x) }));
  }, [fit]);

  const predicted =
    fit && x !== "" && Number.isFinite(Number(x)) ? predict(fit, Number(x)) : null;

  return (
    <div className="w-full p-8">
      <div className="mb-4">
        <BackLink href="/models">Back to Models</BackLink>
      </div>

      <PageHeader
        title="Future requirements"
        subtitle="Fit a straight line through what a model has already recorded, then read off what it implies for a value that has not happened yet."
      />

      {/* Which prediction */}
      <div className="mb-6 flex flex-wrap gap-2">
        {SERIES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSeriesKey(s.key)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              s.key === seriesKey
                ? "border-pes bg-pes text-white"
                : "border-line bg-white text-body hover:bg-canvas"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mb-6 max-w-3xl text-sm text-muted">{series.question}</p>

      {loading ? (
        <p className="text-sm text-muted">Loading the history…</p>
      ) : error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : !fit ? (
        <div className="rounded-lg border border-line bg-white px-6 py-8 text-sm text-muted">
          <p className="mb-1 font-medium text-strong">Not enough history to fit a line.</p>
          <p>
            Two runs with different {series.xLabel} values are the minimum. There{" "}
            {points.length === 1 ? "is 1 usable run" : `are ${points.length} usable runs`} so
            far — run the source model a few more times and save each result.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          {/* Scatter + best fit */}
          <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-strong">
              Recorded runs and the best-fit line
            </h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    label={{ value: series.xLabel, position: "insideBottom", offset: -12 }}
                  />
                  <YAxis label={{ value: series.yLabel, angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={28} />
                  <Scatter name="Recorded runs" dataKey="observed" fill="#4f46e5" />
                  <Line
                    name="Best fit"
                    type="linear"
                    dataKey="fitted"
                    stroke="#dc2626"
                    dot={false}
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* The fit, then the extrapolation */}
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-strong">The fitted line</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center text-body">
                    a — intercept
                    <InfoPopover text="Where the best-fit line crosses the y axis." />
                  </dt>
                  <dd className="font-mono font-semibold text-strong">{fit.a.toFixed(4)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center text-body">
                    b — gradient
                    <InfoPopover text="The slope of the best-fit line: how much y moves per unit of x." />
                  </dt>
                  <dd className="font-mono font-semibold text-strong">{fit.b.toFixed(4)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center text-body">
                    R²
                    <InfoPopover text="How much of the variation between the recorded runs the straight line accounts for. 1.00 is a perfect fit; 0 means the line explains nothing. Below about 0.7 the runs are not really a straight line, and the prediction should be treated with care." />
                  </dt>
                  <dd className="font-mono font-semibold text-strong">{fit.r2.toFixed(4)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-body">Runs used</dt>
                  <dd className="font-mono font-semibold text-strong">{fit.points.length}</dd>
                </div>
              </dl>
              <p className="mt-4 rounded-md bg-canvas px-3 py-2 font-mono text-xs text-body">
                y = {fit.a.toFixed(4)} {fit.b < 0 ? "−" : "+"} {Math.abs(fit.b).toFixed(4)}x
              </p>
              {/* Two readings of the same fit, and the client asked for both to be
                  spelled out rather than left to the operator: how well the line
                  describes the runs, and whether there are enough runs for that
                  number to mean anything. Two points always give R² = 1. */}
              <div className="mt-4 space-y-2">
                <p className="text-xs text-body">
                  <strong>Reading R²:</strong> it is the share of the variation between
                  the recorded runs that the straight line accounts for. 1.00 is a
                  perfect fit and 0 explains nothing. Above about 0.9 the history is
                  strongly linear and the prediction is dependable; between 0.7 and 0.9
                  it is usable; below 0.7 the runs do not lie on a line and the forecast
                  should be treated as indicative only.
                </p>
                {fit.points.length < 3 ? (
                  <p className="rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-700">
                    Only {fit.points.length} runs are recorded. A line through two points
                    fits them perfectly — R² will read 1.00 whatever the data — so that
                    figure means nothing yet. Record at least three runs before relying
                    on this prediction.
                  </p>
                ) : (
                  fit.r2 < 0.7 && (
                    <p className="rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-700">
                      The recorded runs are a poor straight line (R² below 0.7). The
                      prediction is still what the fit says, but this history does not
                      support it well.
                    </p>
                  )
                )}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-strong">Predict</h2>
              <label className="block text-sm font-semibold text-body">
                {series.xLabel}
                <input
                  type="number"
                  value={x}
                  onChange={(e) => setX(e.target.value === "" ? "" : Number(e.target.value))}
                  className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition-shadow focus:border-pes-400 focus:shadow-focus"
                  placeholder="Enter a value to extrapolate to"
                />
              </label>

              {predicted !== null && (
                <div className="mt-4 rounded-lg border border-pes-200 bg-pes-50 px-4 py-3">
                  <p className="text-xs font-medium text-pes-700">{series.yLabel}</p>
                  <p className="mt-1 text-lg font-bold text-pes">
                    {series.answer(predicted, Number(x))}
                  </p>
                  {predicted < 0 && (
                    <p className="mt-2 text-xs text-danger-700">
                      The line goes negative here, which cannot be a real quantity. That x
                      is outside the range the recorded runs can speak to.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
