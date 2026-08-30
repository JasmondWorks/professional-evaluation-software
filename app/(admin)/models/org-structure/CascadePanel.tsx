"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/app/utils/apiFetch";
import HistoryPicker from "@/app/components/models/HistoryPicker";
import { runCascade } from "@/app/lib/models/orgCascade";
import { findOptimalK } from "@/app/(admin)/models/personnel-utilization/lib/util-models11-16";
import { useCurrentUser } from "@/app/components/useCurrentUser";
import {
  boundaryViolations,
  hasConstraintParams,
  type ConstraintParams,
} from "@/app/lib/models/boundaryConditions";

// Sections 17, 18 and 19 as one screen.
//
// They used to be independent cards of Σ-terms that the operator had to derive
// elsewhere and type in. They are not independent: 17 produces the head count
// that 18 divides down level by level, and 18's ladder *is* 19's shape.
//
// Section 21 was here too until the client moved it, on 30 August, to the
// Supervision Cost tab of the Redundancy Index — the ladder it compares against
// the real organization is the cost-driven one, not this.

type StaffRun = {
  id: number;
  methodType: string;
  staffNeeded: number | null;
  createdAt: string;
};

// A level is not part of the ladder until its own utilization run has been
// executed. The client's sketch has an Execute in every box for exactly this
// reason: each level's λ and μ replace the level below's, and the operator is
// meant to see the K* that produced before carrying the count upward.
type LevelRun = { Kstar: number; Hstar: number; rho: number; violations: string[] };
type LevelRates = {
  lambda: number | "";
  mu: number | "";
  A: number | "";
  run: LevelRun | null;
  error: string | null;
};

const emptyLevel = (): LevelRates => ({ lambda: "", mu: "", A: 8, run: null, error: null });

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

export default function CascadePanel({ onSave }: { onSave: (section: number, result: number, numerator: number[], denominator: number[], extra?: any) => Promise<void> }) {
  // ---- Section 17 inputs ----
  const [staffRuns, setStaffRuns] = useState<StaffRun[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [supervisoryKstar, setSupervisoryKstar] = useState<number | "">("");
  // Which utilization run that K* came from. Saving the structure writes the
  // head counts back onto that run, so the future staff-number prediction can
  // read a K* and its staff number off one row — the client's instruction of
  // 30 August.
  const [utilizationRunId, setUtilizationRunId] = useState<number | null>(null);
  // The rest of that run's parameter set. The client's rule: the full form is
  // filled once, at level 1, and every level above holds it constant while
  // supplying only its own rates — which is what lets the boundary conditions
  // be tested all the way up rather than at the supervisory level alone.
  const [inherited, setInherited] = useState<ConstraintParams | null>(null);

  // ---- Section 18 inputs: one λ/μ pair per level above the first ----
  const [levelRates, setLevelRates] = useState<LevelRates[]>([emptyLevel()]);

  const [saving, setSaving] = useState(false);

  // The client's rule of 30 Aug: the organization admin executes the levels;
  // the industrial engineer who runs the models day to day sees the ladder and
  // saves the structure, but does not re-run the rates behind it.
  const { user } = useCurrentUser();
  const mayExecute =
    user?.role === "admin" || user?.role === "super-admin";

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
      // Only the executed levels, and only as far as the first one that has not
      // been executed — a gap in the middle would silently shift every level
      // above it down a rung.
      levels: takeExecutedPrefix(levelRates)
        .map((r) => ({
          lambda: Number(r.lambda),
          mu: Number(r.mu),
          A: r.A === "" ? 8 : Number(r.A),
        })),
    });
  }, [staffNumber, supervisoryKstar, levelRates]);

  function updateLevel(i: number, patch: Partial<LevelRates>) {
    setLevelRates((prev) => prev.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  }

  /** The Execute in a level's box: run personnel utilization on that level's own
   *  rates and keep the K* it returned. Editing any rate clears it again, so a
   *  displayed K* always belongs to the numbers next to it. */
  function executeLevel(i: number) {
    const r = levelRates[i];
    if (r.lambda === "" || r.mu === "") {
      updateLevel(i, { run: null, error: "Enter λ and μ for this level first." });
      return;
    }
    if (!(Number(r.lambda) < Number(r.mu))) {
      updateLevel(i, { run: null, error: "λ must be strictly less than μ." });
      return;
    }
    const A = r.A === "" ? 8 : Number(r.A);
    const { Kstar, Hstar, rho } = findOptimalK({
      A,
      lambda: Number(r.lambda),
      mu: Number(r.mu),
    } as any);
    if (!(Kstar > 0) || !Number.isFinite(Hstar)) {
      updateLevel(i, { run: null, error: "Those rates produced no optimal K." });
      return;
    }
    // Eq. 39, 40 and 42 with the level-1 run's parameters and this level's own
    // K and rates. Only when that run actually carried them: a run saved before
    // they were stored has nothing to inherit, and testing against zeros would
    // fail every level for the wrong reason.
    const violations = hasConstraintParams(inherited)
      ? boundaryViolations(inherited!, Kstar, Number(r.lambda), Number(r.mu))
      : [];

    updateLevel(i, { run: { Kstar, Hstar, rho, violations }, error: null });
  }

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

      // The pairing the future staff-number prediction needs: this K*, and the
      // organization it implies. Best-effort — the structure is saved either
      // way, and a failure here costs a data point, not the run.
      if (utilizationRunId != null && staffNumber != null) {
        const management = cascade.levels.reduce((sum, l) => sum + l.count, 0);
        try {
          await apiFetch("/api/personnelUtilization", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: utilizationRunId,
              staff_number: Number(staffNumber) + management,
              supervisory_staff: Number(staffNumber),
              management_staff: management,
              staff_method: selectedStaff?.methodType ?? null,
            }),
          });
        } catch {
          /* the structure is saved; the pairing can be re-made on the next run */
        }
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
                onSelect={(run: any) => {
                  if (run.kstar != null) setSupervisoryKstar(Number(run.kstar));
                  setUtilizationRunId(run.id ?? null);
                  setInherited({
                    alpha: run.alpha,
                    Y: run.y_coef,
                    W: run.w_val,
                    D: run.d_val,
                    G: run.g_val,
                    J: run.j_val,
                    t1: run.t1,
                    t2: run.t2,
                    t3: run.t3,
                    t4: run.t4,
                  });
                  // Every level is re-tested against the newly inherited set.
                  setLevelRates((prev) =>
                    prev.map((p) => ({ ...p, run: null, error: null })),
                  );
                }}
              />
            </div>
            <input
              type="number"
              value={supervisoryKstar}
              onChange={(e) => {
                setSupervisoryKstar(e.target.value === "" ? "" : Number(e.target.value));
                // Typed by hand, so it is no longer a particular stored run and
                // there is nothing to inherit.
                setUtilizationRunId(null);
                setInherited(null);
              }}
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
          needs its own λ and μ, which replace the ones below and give it its own K*
          to divide by — press Execute in the level's box to run them. Everything else
          is held constant from the level-1 utilization run picked above, and each
          level's K* is tested against those same boundary conditions. The ladder ends
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
                    updateLevel(i, {
                      lambda: e.target.value === "" ? "" : Number(e.target.value),
                      run: null,
                      error: null,
                    })
                  }
                  readOnly={!mayExecute}
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
                    updateLevel(i, {
                      mu: e.target.value === "" ? "" : Number(e.target.value),
                      run: null,
                      error: null,
                    })
                  }
                  readOnly={!mayExecute}
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
                    updateLevel(i, {
                      A: e.target.value === "" ? "" : Number(e.target.value),
                      run: null,
                      error: null,
                    })
                  }
                  readOnly={!mayExecute}
                  className={field}
                />
              </label>
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
                <div className="rounded-lg border border-pes-200 bg-pes-50 px-4 py-3 sm:col-span-4">
                  <p className="text-xs font-medium text-pes-700">
                    Personnel utilization at this level
                  </p>
                  <p className="mt-0.5 text-sm text-pes">
                    <span className="text-2xl font-bold">K* = {r.run.Kstar}</span>
                    <span className="ml-3 text-xs">
                      H* = {r.run.Hstar.toFixed(4)} · ρ = {r.run.rho.toFixed(4)}
                    </span>
                  </p>
                  {r.run.violations.length > 0 && (
                    <div className="mt-2 rounded-md border border-warning-200 bg-warning-50 px-3 py-2">
                      <p className="text-xs font-medium text-warning-700">
                        This span breaks the boundary conditions carried up from level 1:
                      </p>
                      <ul className="mt-1 list-inside list-disc text-xs text-warning-700">
                        {r.run.violations.map((v) => (
                          <li key={v}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted sm:col-span-4">
                  {mayExecute
                    ? "Execute this level to get its K*. The level above it is not counted until you do."
                    : "This level has not been executed yet. Only the organization admin can execute a level; you can save the structure once every level has been."}
                </p>
              )}

              {(r.error ??
                (r.lambda !== "" && r.mu !== "" && Number(r.lambda) >= Number(r.mu)
                  ? "λ must be strictly less than μ."
                  : null)) && (
                <p className="text-xs text-danger-700 sm:col-span-4">
                  {r.error ??
                    "λ must be strictly less than μ."}
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

        {levelRates.some((r) => !r.run) && (
          <p className="mt-4 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700">
            {takeExecutedPrefix(levelRates).length} of {levelRates.length} levels executed.
            The ladder below only counts the executed ones.
          </p>
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
