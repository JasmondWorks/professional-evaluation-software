"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/app/utils/apiFetch";
import { useStickyState } from "@/app/lib/models/useStickyState";
import { getAccessToken } from "@/app/utils/auth";
import HistoryPicker from "@/app/components/models/HistoryPicker";
import { useCurrentUser } from "@/app/components/useCurrentUser";
import { findOptimalKCost } from "../personnel-utilization/lib/util-models11-16";
import {
  runCostCascade,
  percentageRedundancy,
  personnelRedundancy,
} from "@/app/lib/models/orgCascade";

// The management ladder again, and Section 21 with it.
//
// The client's instruction of 30 August: percentage redundancy does not belong
// on the organization structure page, it belongs here, under Supervision Cost,
// and this page should be built like that one. The two differ in exactly one
// place — the organization structure divides by the K* that maximises
// utilization H, and this divides by the K* that minimises supervision cost D.
// So the ladder is shared code (runCostCascade), and only the solver changes.

type StaffRun = {
  id: number;
  methodType: string;
  staffNeeded: number | null;
  createdAt: string;
};

type LevelRun = { Kstar: number; Dstar: number; rho: number };
type LevelRates = {
  lambda: number | "";
  mu: number | "";
  A: number | "";
  a: number | "";
  b: number | "";
  run: LevelRun | null;
  error: string | null;
};

const emptyLevel = (): LevelRates => ({
  lambda: "",
  mu: "",
  A: 8,
  a: 50,
  b: 50,
  run: null,
  error: null,
});

/** Levels count only up to the first one still awaiting its Execute. */
function takeExecutedPrefix(rows: LevelRates[]): LevelRates[] {
  const out: LevelRates[] = [];
  for (const r of rows) {
    if (!r.run) break;
    out.push(r);
  }
  return out;
}

const METHOD_LABELS: Record<string, string> = {
  Method1: "Plain estimation",
  Method2: "Factor estimation",
  Method3: "Confidence limits",
  "Work Sampling": "Work sample",
};

export default function CostCascadePanel() {
  const [staffRuns, setStaffRuns] = useState<StaffRun[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [selectedStaffId, setSelectedStaffId] = useStickyState<number | null>("pes.cost.staffRun", null);
  const [supervisoryKstar, setSupervisoryKstar] = useStickyState<number | "">("pes.cost.kstar", "");
  const [levelRates, setLevelRates] = useStickyState<LevelRates[]>("pes.cost.levels", [emptyLevel()]);
  // The real head counts come from the employee records — the client's answer
  // of 30 August. They stay editable: a record may not have been given its
  // management level yet, and the operator should not be blocked by that.
  const [realCounts, setRealCounts] = useStickyState<Record<number, number | "">>("pes.cost.realCounts", {});
  const [employeeCounts, setEmployeeCounts] = useState<Record<number, number> | null>(null);
  const [employeesAssigned, setEmployeesAssigned] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Same rule as the organization structure: the admin executes, the engineer
  // reads the ladder and saves it.
  const { user } = useCurrentUser();
  const mayExecute = user?.role === "admin" || user?.role === "super-admin";

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/management-levels", { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const counts: Record<number, number> = {};
        for (const [level, n] of Object.entries(data.counts ?? {})) {
          counts[Number(level)] = Number(n);
        }
        setEmployeeCounts(counts);
        setEmployeesAssigned(Number(data.assigned ?? 0));
        // Seed the table with what the records say. Anything the operator has
        // already typed wins, so this cannot overwrite work in progress.
        setRealCounts((prev) => {
          const next = { ...prev };
          for (const [level, n] of Object.entries(counts)) {
            if (next[Number(level)] === undefined) next[Number(level)] = n;
          }
          return next;
        });
      } catch {
        /* the fields stay typed-in, as before */
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
    return runCostCascade({
      staffNumber: Number(staffNumber),
      supervisoryKstar: Number(supervisoryKstar),
      levels: takeExecutedPrefix(levelRates).map((r) => ({
        lambda: Number(r.lambda),
        mu: Number(r.mu),
        A: r.A === "" ? 8 : Number(r.A),
        a: r.a === "" ? 0 : Number(r.a),
        b: r.b === "" ? 0 : Number(r.b),
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
        // The client asked for the head count itself, not only the percentage:
        // how many posts at this level the computation finds surplus. Negative
        // means the level is short-staffed against its ideal, which is worth
        // seeing rather than clamping to zero.
        redundant: realNum == null ? null : realNum - l.count,
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

  /** The head count the whole ladder finds surplus, which is what the client
   *  asked to see beside the percentage. Shortfalls at one level do not cancel
   *  a surplus at another — they are different problems — so only the positive
   *  ones are summed. */
  const totalRedundant = useMemo(
    () => redundancyRows.reduce((sum, r) => sum + Math.max(0, r.redundant ?? 0), 0),
    [redundancyRows],
  );

  function updateLevel(i: number, patch: Partial<LevelRates>) {
    setLevelRates((prev) => prev.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  }

  function executeLevel(i: number) {
    const r = levelRates[i];
    if (r.lambda === "" || r.mu === "") {
      updateLevel(i, { run: null, error: "Enter λ and μ for this level first." });
      return;
    }
    if (!(Number(r.lambda) < Number(r.mu))) {
      updateLevel(i, { run: null, error: "λ must be strictly less than μ (Eq. 8.9)." });
      return;
    }
    const { Kstar, Dstar, rho } = findOptimalKCost({
      A: r.A === "" ? 8 : Number(r.A),
      a: r.a === "" ? 0 : Number(r.a),
      b: r.b === "" ? 0 : Number(r.b),
      lambda: Number(r.lambda),
      mu: Number(r.mu),
    });
    if (!(Kstar > 0) || !Number.isFinite(Dstar)) {
      updateLevel(i, { run: null, error: "Those rates produced no optimal K." });
      return;
    }
    updateLevel(i, { run: { Kstar, Dstar, rho }, error: null });
  }

  async function saveRedundancy() {
    if (!cascade || overallRedundancy == null) return;
    const token = getAccessToken();
    if (!token) {
      setSaveMsg("Missing token — please log in again.");
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await apiFetch("/api/orgStructure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          section: 21,
          result: overallRedundancy,
          numerator: redundancyRows.map((r) => r.real ?? 0),
          denominator: redundancyRows.map((r) => r.ideal),
          // Kept so the history can show what the percentage was drawn from —
          // the ladder itself, not merely its final number.
          extra_data: {
            source: "supervision-cost",
            staffNumber,
            supervisoryKstar,
            method: selectedStaff?.methodType,
            levels: cascade.levels.map((l) => ({
              level: l.level,
              kstar: l.kstar,
              ideal: l.count,
              real: realCounts[l.level] ?? null,
            })),
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSaveMsg("✅ Percentage redundancy saved to the history.");
    } catch (err: any) {
      setSaveMsg(`❌ ${err.message ?? "Error saving result."}`);
    } finally {
      setSaving(false);
    }
  }

  const field =
    "mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition-shadow focus:border-pes-400 focus:shadow-focus";

  return (
    <div className="mt-10 flex flex-col gap-6">
      {/* ===== Supervisory size ===== */}
      <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-strong">Supervisory size</h2>
        <p className="mt-1 text-sm text-muted">
          The staff number from whichever estimation method you used, divided by the K*
          that minimises supervision cost.
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
                dstar: number | null;
                lambda: number | null;
                mu: number | null;
              }>
                source="supervision-cost"
                label="Pick from supervision cost history"
                columns={[
                  { label: "K*", render: (r) => r.kstar ?? "—" },
                  { label: "D*", render: (r) => (r.dstar == null ? "—" : Number(r.dstar).toFixed(4)) },
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
              readOnly={!mayExecute}
              className={field}
              placeholder="K* from a supervision cost run"
            />

            {staffNumber != null && supervisoryKstar !== "" && cascade?.levels[0] && (
              <div className="mt-4 rounded-lg border border-pes-200 bg-pes-50 px-4 py-3">
                <p className="text-xs font-medium text-pes-700">No-1 — managers at level 1</p>
                <p className="mt-0.5 text-3xl font-bold text-pes">{cascade.levels[0].count}</p>
                <p className="mt-1 text-xs text-pes-700">
                  {Number(staffNumber).toFixed(0)} ÷ {supervisoryKstar}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Management levels ===== */}
      <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-strong">Management levels</h2>
        <p className="mt-1 text-sm text-muted">
          Each level's head count becomes the numerator of the level above it. That level
          takes its own rates and cost coefficients, and Execute gives it its own K* — the
          span that minimises D. The ladder ends when a level holds a single post.
        </p>

        <div className="mt-5 space-y-3">
          {levelRates.map((r, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-line p-4 sm:grid-cols-6">
              <p className="text-sm font-semibold text-body sm:col-span-6">Level {i + 2}</p>

              {([
                ["lambda", "λ — arrival rate", "0.0001"],
                ["mu", "μ — service rate", "0.0001"],
                ["A", "A — hours/day", "0.1"],
                ["a", "a — boss cost/hr", "1"],
                ["b", "b — staff cost/hr", "1"],
              ] as const).map(([key, label, step]) => (
                <label key={key} className="text-xs font-medium text-muted">
                  {label}
                  <input
                    type="number"
                    step={step}
                    value={r[key]}
                    onChange={(e) =>
                      updateLevel(i, {
                        [key]: e.target.value === "" ? "" : Number(e.target.value),
                        run: null,
                        error: null,
                      } as Partial<LevelRates>)
                    }
                    readOnly={!mayExecute}
                    className={field}
                  />
                </label>
              ))}

              <div className="flex items-end gap-2">
                {mayExecute && (
                  <button
                    type="button"
                    onClick={() => executeLevel(i)}
                    disabled={r.lambda === "" || r.mu === ""}
                    className={`rounded-md px-3 py-2 text-xs font-medium text-white ${
                      r.lambda === "" || r.mu === ""
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-pes hover:opacity-90"
                    }`}
                  >
                    {r.run ? "Re-execute" : "Execute"}
                  </button>
                )}
                {mayExecute && levelRates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLevelRates((prev) => prev.filter((_, j) => j !== i))}
                    className="rounded-md border border-line px-3 py-2 text-xs text-danger-700 hover:bg-danger-50"
                  >
                    Remove
                  </button>
                )}
              </div>

              {r.run ? (
                <div className="rounded-lg border border-pes-200 bg-pes-50 px-4 py-3 sm:col-span-6">
                  <p className="text-xs font-medium text-pes-700">
                    Supervision cost at this level
                  </p>
                  <p className="mt-0.5 text-sm text-pes">
                    <span className="text-2xl font-bold">K* = {r.run.Kstar}</span>
                    <span className="ml-3 text-xs">
                      D* = {r.run.Dstar.toFixed(4)} · ρ = {r.run.rho.toFixed(4)}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted sm:col-span-6">
                  {mayExecute
                    ? "Execute this level to get its K*. The level above it is not counted until you do."
                    : "This level has not been executed yet. Only the organization admin can execute a level."}
                </p>
              )}

              {(r.error ??
                (r.lambda !== "" && r.mu !== "" && Number(r.lambda) >= Number(r.mu)
                  ? "λ must be strictly less than μ (Eq. 8.9)."
                  : null)) && (
                <p className="text-xs text-danger-700 sm:col-span-6">
                  {r.error ?? "λ must be strictly less than μ (Eq. 8.9)."}
                </p>
              )}
            </div>
          ))}
          {mayExecute && (
            <button
              type="button"
              onClick={() => setLevelRates((prev) => [...prev, emptyLevel()])}
              className="rounded-md border border-pes px-3 py-2 text-xs font-medium text-pes hover:bg-pes-50"
            >
              + Add another management level
            </button>
          )}
        </div>

        {levelRates.some((r) => !r.run) && (
          <p className="mt-4 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700">
            {takeExecutedPrefix(levelRates).length} of {levelRates.length} levels executed.
            The ladder below only counts the executed ones.
          </p>
        )}

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

      {/* ===== 21. Percentage redundancy ===== */}
      {cascade && cascade.levels.length > 0 && (
        <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-strong">21. Percentage redundancy</h2>
          <p className="mt-1 text-sm text-muted">
            No-n is the ideal number of management staff at each level. The real figures
            are counted from the employee records — from the management level on each
            record — and can be corrected here if a record has not been given one yet.
          </p>
          {employeesAssigned === 0 && (
            <p className="mt-3 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700">
              No employee record carries a management level yet, so nothing could be
              counted. Set the management level on the managers in the employee database,
              or enter the real figures by hand below.
            </p>
          )}

          <div className="mt-5 overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas font-medium text-body">
                <tr>
                  <th className="px-4 py-2">Level</th>
                  <th className="px-4 py-2">Ideal (No-n)</th>
                  <th className="px-4 py-2">Real</th>
                  <th className="px-4 py-2">Redundant staff</th>
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
                      {employeeCounts?.[r.level] !== undefined && (
                        <span className="ml-2 text-xs text-muted">
                          {employeeCounts[r.level]} on record
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-2 font-semibold ${
                        r.redundant == null
                          ? "text-muted"
                          : r.redundant > 0
                            ? "text-danger-700"
                            : "text-green-700"
                      }`}
                    >
                      {r.redundant == null
                        ? "—"
                        : r.redundant > 0
                          ? `${r.redundant} surplus`
                          : r.redundant < 0
                            ? `${Math.abs(r.redundant)} short`
                            : "none"}
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
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-pes-200 bg-pes-50 px-4 py-3">
                <p className="text-xs font-medium text-pes-700">Personnel redundancy</p>
                <p className="mt-0.5 text-3xl font-bold text-pes">
                  {overallRedundancy.toFixed(2)}%
                </p>
                <p className="mt-1 text-xs text-pes-700">
                  Surplus across every level, against the total actually employed.
                </p>
              </div>
              <div className="rounded-lg border border-line bg-canvas px-4 py-3">
                <p className="text-xs font-medium text-muted">Staff found redundant</p>
                <p className="mt-0.5 text-3xl font-bold text-strong">{totalRedundant}</p>
                <p className="mt-1 text-xs text-muted">
                  Management posts across every level beyond what the computation says the
                  organization needs.
                </p>
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={saveRedundancy}
              disabled={overallRedundancy == null || saving}
              className={`rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors ${
                overallRedundancy != null && !saving
                  ? "bg-pes hover:opacity-90"
                  : "cursor-not-allowed bg-gray-400"
              }`}
            >
              {saving ? "Saving…" : "Save percentage redundancy"}
            </button>
            <Link
              href="/models/redundancy-index/supervision-cost-history"
              className="text-sm text-pes underline"
            >
              View history
            </Link>
          </div>
          {saveMsg && <p className="mt-2 text-sm text-body">{saveMsg}</p>}
        </section>
      )}
    </div>
  );
}
