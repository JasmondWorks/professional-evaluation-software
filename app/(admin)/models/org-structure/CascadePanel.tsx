"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/app/utils/apiFetch";
import HistoryPicker from "@/app/components/models/HistoryPicker";
import {
  runCascade,
  percentageRedundancy,
  personnelRedundancy,
} from "@/app/lib/models/orgCascade";

// Sections 17, 18, 19 and 21 as one screen.
//
// They used to be four independent cards of Σ-terms that the operator had to
// derive elsewhere and type in. They are not independent: 17 produces the head
// count that 18 divides down level by level, 18's ladder *is* 19's shape, and 21
// compares that same ladder against the real organization. Splitting them apart
// meant the numbers on screen could contradict each other, so they are computed
// together here.

type StaffRun = {
  id: number;
  methodType: string;
  staffNeeded: number | null;
  createdAt: string;
};

type LevelRates = { lambda: number | ""; mu: number | ""; A: number | "" };

const METHOD_LABELS: Record<string, string> = {
  Method1: "Plain estimation",
  Method2: "Factor estimation",
  Method3: "Confidence limits",
  "Work Sampling": "Work sample",
};

export default function CascadePanel({ onSave }: { onSave: (section: number, result: number, numerator: number[], denominator: number[], extra?: any) => Promise<void> }) {
  // ---- Section 17 inputs ----
  const [staffRuns, setStaffRuns] = useState<StaffRun[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [supervisoryKstar, setSupervisoryKstar] = useState<number | "">("");

  // ---- Section 18 inputs: one λ/μ pair per level above the first ----
  const [levelRates, setLevelRates] = useState<LevelRates[]>([
    { lambda: "", mu: "", A: 8 },
  ]);

  // ---- Section 21 inputs: what the organization really employs per level ----
  const [realCounts, setRealCounts] = useState<Record<number, number | "">>({});

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/getStaffEstimation", { method: "GET" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const rows: StaffRun[] = Array.isArray(data) ? data : (data.data ?? []);
        if (!cancelled) setStaffRuns(rows.filter((r) => r.staffNeeded != null));
      } catch {
        /* the empty state below covers it */
      } finally {
        if (!cancelled) setLoadingStaff(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedStaff = staffRuns.find((r) => r.id === selectedStaffId) ?? null;
  const staffNumber = selectedStaff?.staffNeeded ?? null;

  const cascade = useMemo(() => {
    if (staffNumber == null || supervisoryKstar === "") return null;
    return runCascade({
      staffNumber: Number(staffNumber),
      supervisoryKstar: Number(supervisoryKstar),
      levels: levelRates
        .filter((r) => r.lambda !== "" && r.mu !== "")
        .map((r) => ({
          lambda: Number(r.lambda),
          mu: Number(r.mu),
          A: r.A === "" ? 8 : Number(r.A),
        })),
    });
  }, [staffNumber, supervisoryKstar, levelRates]);

  const redundancyRows = useMemo(() => {
    if (!cascade) return [];
    return cascade.levels.map((l) => {
      const real = realCounts[l.level];
      const realNum = real === "" || real === undefined ? null : Number(real);
      return {
        level: l.level,
        ideal: l.count,
        real: realNum,
        pr: realNum == null ? null : percentageRedundancy(l.count, realNum),
      };
    });
  }, [cascade, realCounts]);

  const overallRedundancy = useMemo(() => {
    const usable = redundancyRows
      .filter((r) => r.real != null)
      .map((r) => ({ ideal: r.ideal, real: r.real as number }));
    return usable.length ? personnelRedundancy(usable) : null;
  }, [redundancyRows]);

  async function saveStructure() {
    if (!cascade || !cascade.reachedTop) return;
    setSaving(true);
    try {
      // 18 records the ladder itself; 19 records its shape — the counts over the
      // number of levels — which is all section 19 ever was.
      await onSave(
        18,
        cascade.levels[cascade.levels.length - 1].count,
        cascade.levels.map((l) => l.count),
        cascade.levels.map((l) => l.kstar),
        { staffNumber, supervisoryKstar, method: selectedStaff?.methodType },
      );
      await onSave(
        19,
        cascade.n,
        cascade.levels.map((l) => l.count),
        [cascade.n],
      );
      if (overallRedundancy != null) {
        await onSave(
          21,
          overallRedundancy,
          redundancyRows.map((r) => r.real ?? 0),
          redundancyRows.map((r) => r.ideal),
        );
      }
    } finally {
      setSaving(false);
    }
  }

  const field =
    "mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition-shadow focus:border-pes-400 focus:shadow-focus";

  return (
    <div className="flex flex-col gap-6">
      {/* ===== 17. Supervisory size ===== */}
      <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-strong">17. Supervisory size</h2>
        <p className="mt-1 text-sm text-muted">
          The staff number from whichever estimation method you used, divided by the
          optimal span of control K* from Personnel Utilization.
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-body">
              Staff number — pick the run to use
            </p>
            {loadingStaff ? (
              <p className="text-sm text-muted">Loading the staff number history…</p>
            ) : staffRuns.length === 0 ? (
              <p className="text-sm text-muted">
                No staff number saved yet.{" "}
                <Link href="/models/staff-number" className="text-pes underline">
                  Run the Staff Number model
                </Link>{" "}
                first.
              </p>
            ) : (
              <div className="max-h-56 overflow-auto rounded-lg border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-canvas font-medium text-body">
                    <tr>
                      <th className="px-3 py-2">Method</th>
                      <th className="px-3 py-2">Staff needed</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {staffRuns.map((r) => (
                      <tr
                        key={r.id}
                        className={r.id === selectedStaffId ? "bg-pes-50" : "hover:bg-canvas"}
                      >
                        <td className="px-3 py-2">{METHOD_LABELS[r.methodType] ?? r.methodType}</td>
                        <td className="px-3 py-2 font-semibold text-strong">
                          {Number(r.staffNeeded).toFixed(0)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-muted">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedStaffId(r.id)}
                            className="rounded-md border border-pes px-2.5 py-1 text-xs font-medium text-pes hover:bg-pes-50"
                          >
                            {r.id === selectedStaffId ? "Selected" : "Use"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-body">Supervisory K*</p>
              <HistoryPicker<{
                id: number;
                created_at: string;
                kstar: number | null;
                hstar: number | null;
                lambda: number | null;
                mu: number | null;
              }>
                source="personnel-utilization"
                label="Pick from utilization history"
                columns={[
                  { label: "K*", render: (r) => r.kstar ?? "—" },
                  { label: "H*", render: (r) => (r.hstar == null ? "—" : Number(r.hstar).toFixed(4)) },
                  { label: "λ", render: (r) => (r.lambda == null ? "—" : Number(r.lambda).toFixed(4)) },
                  { label: "μ", render: (r) => (r.mu == null ? "—" : Number(r.mu).toFixed(4)) },
                ]}
                onSelect={(run) => {
                  if (run.kstar != null) setSupervisoryKstar(Number(run.kstar));
                }}
              />
            </div>
            <input
              type="number"
              value={supervisoryKstar}
              onChange={(e) =>
                setSupervisoryKstar(e.target.value === "" ? "" : Number(e.target.value))
              }
              className={field}
              placeholder="K* from Personnel Utilization"
            />

            {staffNumber != null && supervisoryKstar !== "" && cascade?.levels[0] && (
              <div className="mt-4 rounded-lg border border-pes-200 bg-pes-50 px-4 py-3">
                <p className="text-xs font-medium text-pes-700">
                  No-1 — managers at level 1
                </p>
                <p className="mt-0.5 text-3xl font-bold text-pes">{cascade.levels[0].count}</p>
                <p className="mt-1 text-xs text-pes-700">
                  {Number(staffNumber).toFixed(0)} ÷ {supervisoryKstar}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== 18. Management levels ===== */}
      <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-strong">18. Management levels</h2>
        <p className="mt-1 text-sm text-muted">
          Each level's head count becomes the numerator of the level above it. That level
          needs its own λ and μ, which give it its own K* to divide by. The ladder ends
          when a level holds a single post.
        </p>

        <div className="mt-5 space-y-3">
          {levelRates.map((r, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-line p-4 sm:grid-cols-4">
              <p className="text-sm font-semibold text-body sm:col-span-4">
                Level {i + 2} rates
              </p>
              <label className="text-xs font-medium text-muted">
                λ — arrival rate
                <input
                  type="number"
                  step="0.0001"
                  value={r.lambda}
                  onChange={(e) =>
                    setLevelRates((prev) =>
                      prev.map((p, j) =>
                        j === i
                          ? { ...p, lambda: e.target.value === "" ? "" : Number(e.target.value) }
                          : p,
                      ),
                    )
                  }
                  className={field}
                />
              </label>
              <label className="text-xs font-medium text-muted">
                μ — service rate
                <input
                  type="number"
                  step="0.0001"
                  value={r.mu}
                  onChange={(e) =>
                    setLevelRates((prev) =>
                      prev.map((p, j) =>
                        j === i
                          ? { ...p, mu: e.target.value === "" ? "" : Number(e.target.value) }
                          : p,
                      ),
                    )
                  }
                  className={field}
                />
              </label>
              <label className="text-xs font-medium text-muted">
                A — availability
                <input
                  type="number"
                  step="0.1"
                  value={r.A}
                  onChange={(e) =>
                    setLevelRates((prev) =>
                      prev.map((p, j) =>
                        j === i
                          ? { ...p, A: e.target.value === "" ? "" : Number(e.target.value) }
                          : p,
                      ),
                    )
                  }
                  className={field}
                />
              </label>
              <div className="flex items-end">
                {levelRates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLevelRates((prev) => prev.filter((_, j) => j !== i))}
                    className="rounded-md border border-line px-3 py-2 text-xs text-danger-700 hover:bg-danger-50"
                  >
                    Remove level
                  </button>
                )}
              </div>
              {r.lambda !== "" && r.mu !== "" && Number(r.lambda) >= Number(r.mu) && (
                <p className="text-xs text-danger-700 sm:col-span-4">
                  λ must be strictly less than μ.
                </p>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLevelRates((prev) => [...prev, { lambda: "", mu: "", A: 8 }])}
            className="rounded-md border border-pes px-3 py-2 text-xs font-medium text-pes hover:bg-pes-50"
          >
            + Add another management level
          </button>
        </div>

        {cascade && cascade.levels.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas font-medium text-body">
                <tr>
                  <th className="px-4 py-2">Level</th>
                  <th className="px-4 py-2">Numerator</th>
                  <th className="px-4 py-2">λ</th>
                  <th className="px-4 py-2">μ</th>
                  <th className="px-4 py-2">K*</th>
                  <th className="px-4 py-2">No-n</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {cascade.levels.map((l) => (
                  <tr key={l.level}>
                    <td className="px-4 py-2 font-medium text-strong">{l.level}</td>
                    <td className="px-4 py-2">{l.numerator}</td>
                    <td className="px-4 py-2 text-muted">
                      {Number.isFinite(l.lambda) ? l.lambda.toFixed(4) : "—"}
                    </td>
                    <td className="px-4 py-2 text-muted">
                      {Number.isFinite(l.mu) ? l.mu.toFixed(4) : "—"}
                    </td>
                    <td className="px-4 py-2">{l.kstar}</td>
                    <td className="px-4 py-2 font-bold text-pes">{l.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {cascade?.note && (
          <p
            className={`mt-4 rounded-lg px-4 py-3 text-sm ${
              cascade.reachedTop
                ? "bg-canvas text-body"
                : "border border-warning-200 bg-warning-50 text-warning-700"
            }`}
          >
            {cascade.note}
          </p>
        )}
      </section>

      {/* ===== 19. Shape of structure ===== */}
      {cascade && cascade.reachedTop && (
        <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-strong">19. Shape of structure</h2>
          <p className="mt-1 text-sm text-muted">
            The head count at each level over the number of levels the cascade took.
            Nothing further is computed here — the shape is the result.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {cascade.levels
              .slice()
              .reverse()
              .map((l) => (
                <span
                  key={l.level}
                  className="rounded-lg border border-pes-200 bg-pes-50 px-4 py-2 text-sm font-semibold text-pes"
                >
                  L{l.level}: {l.count}
                </span>
              ))}
            <span className="text-sm text-muted">over n = {cascade.n}</span>
          </div>
        </section>
      )}

      {/* ===== 21. Percentage redundancy ===== */}
      {cascade && cascade.levels.length > 0 && (
        <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-strong">21. Percentage redundancy</h2>
          <p className="mt-1 text-sm text-muted">
            No-n is the ideal number of management staff at each level. Enter what the
            organization really employs there to see the surplus.
          </p>

          <div className="mt-5 overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas font-medium text-body">
                <tr>
                  <th className="px-4 py-2">Level</th>
                  <th className="px-4 py-2">Ideal (No-n)</th>
                  <th className="px-4 py-2">Real</th>
                  <th className="px-4 py-2">PR %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {redundancyRows.map((r) => (
                  <tr key={r.level}>
                    <td className="px-4 py-2 font-medium text-strong">{r.level}</td>
                    <td className="px-4 py-2">{r.ideal}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={realCounts[r.level] ?? ""}
                        onChange={(e) =>
                          setRealCounts((prev) => ({
                            ...prev,
                            [r.level]: e.target.value === "" ? "" : Number(e.target.value),
                          }))
                        }
                        className="w-28 rounded-md border border-line bg-surface px-2 py-1 text-sm outline-none focus:border-pes-400"
                      />
                    </td>
                    <td
                      className={`px-4 py-2 font-semibold ${
                        r.pr == null ? "text-muted" : r.pr > 0 ? "text-danger-700" : "text-green-700"
                      }`}
                    >
                      {r.pr == null ? "—" : `${r.pr.toFixed(2)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {overallRedundancy != null && (
            <div className="mt-4 rounded-lg border border-pes-200 bg-pes-50 px-4 py-3">
              <p className="text-xs font-medium text-pes-700">Personnel redundancy</p>
              <p className="mt-0.5 text-3xl font-bold text-pes">
                {overallRedundancy.toFixed(2)}%
              </p>
              <p className="mt-1 text-xs text-pes-700">
                Surplus across every level, against the total actually employed.
              </p>
            </div>
          )}
        </section>
      )}

      <div>
        <button
          type="button"
          onClick={saveStructure}
          disabled={!cascade?.reachedTop || saving}
          className={`rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors ${
            cascade?.reachedTop && !saving
              ? "bg-pes hover:opacity-90"
              : "cursor-not-allowed bg-gray-400"
          }`}
        >
          {saving ? "Saving…" : "Save structure"}
        </button>
        {!cascade?.reachedTop && (
          <p className="mt-2 text-xs text-muted">
            The structure is saved once the cascade reaches a single post at the top.
          </p>
        )}
      </div>
    </div>
  );
}
