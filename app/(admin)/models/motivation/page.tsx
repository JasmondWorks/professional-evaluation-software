"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/app/utils/apiFetch";
import { notify } from "@/lib/toast";
import { BackLink, Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui";
import { useCurrentUser } from "@/app/components/useCurrentUser";
import {
  MOTIVATOR_GROUPS,
  COMPULSORY_KEYS,
  PERFORMANCE_LEVELS,
  PERIODS,
  actionScheme,
  entitlementFor,
  levelFromPercentage,
  CERTIFICATE_TYPES,
  type PerformanceLevel,
  type Period,
} from "@/app/lib/motivation/scheme";

// The motivation model, rebuilt from pages 102-109 of the client's document.
//
// What stood here before was a weighted survey — "Job Satisfaction, weight 0.2",
// scored out of 100 — which appears nowhere in the document and produced a
// number nothing consumed. The document describes a scheme, not a score: the
// head of the establishment adopts a set of motivators for their tenure, and
// what a member of staff receives follows from their performance grade and the
// period, through the Motivation Action Scheme.

type Scheme = {
  id: number;
  tenure: string;
  selections: string[];
  additions: string[];
  active: boolean;
  created_at: string;
  closed_at: string | null;
};

type Award = {
  id: number;
  staff_name: string;
  dept: string | null;
  period: string;
  period_label: string;
  level: string;
  motivator: string;
  detail: string | null;
  cash_amount: string | null;
  awarded_at: string;
};

export default function MotivationPage() {
  return (
    <div className="mx-auto w-full p-8">
      <div className="mb-4">
        <BackLink href="/models">Back to Models</BackLink>
      </div>

      <h1 className="text-2xl font-bold text-strong">Motivation of staff</h1>
      <p className="mt-1 max-w-3xl text-body">
        The establishment adopts a set of motivators for an administration, and the
        Motivation Action Scheme decides what each grade of performance earns over each
        period. Nothing is scored here — the performance and appraisal models produce the
        grade, and this says what follows from it.
      </p>

      <Tabs defaultValue="scheme" syncParam="tab" className="mt-8">
        <TabsList className="mb-8">
          <TabsTrigger value="scheme">Adopted motivators</TabsTrigger>
          <TabsTrigger value="action">Action scheme</TabsTrigger>
          <TabsTrigger value="entitlement">What a grade earns</TabsTrigger>
          <TabsTrigger value="record">Award record</TabsTrigger>
        </TabsList>

        <TabsContent value="scheme">
          <SchemeTab />
        </TabsContent>
        <TabsContent value="action">
          <ActionSchemeTab />
        </TabsContent>
        <TabsContent value="entitlement">
          <EntitlementTab />
        </TabsContent>
        <TabsContent value="record">
          <AwardRecordTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------

function SchemeTab() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === "admin" || user?.role === "super-admin";

  const [active, setActive] = useState<Scheme | null>(null);
  const [past, setPast] = useState<Scheme[]>([]);
  const [tenure, setTenure] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(COMPULSORY_KEYS));
  const [additions, setAdditions] = useState<string[]>([]);
  const [newAddition, setNewAddition] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/motivation-scheme", { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.active) {
          setActive(data.active);
          setTenure(data.active.tenure);
          setSelected(new Set([...(data.active.selections ?? []), ...COMPULSORY_KEYS]));
          setAdditions(data.active.additions ?? []);
        }
        setPast(data.past ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function toggle(key: string) {
    if (COMPULSORY_KEYS.includes(key)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function save() {
    if (!tenure.trim()) {
      notify.error("Name the administration this selection belongs to.");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch("/api/motivation-scheme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenure: tenure.trim(),
          selections: Array.from(selected),
          additions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save the scheme.");
      setActive(data.scheme);
      if (data.replaced) {
        notify.success("The previous administration's scheme was closed and kept on record.");
      } else {
        notify.success("Scheme saved.");
      }
    } catch (err: any) {
      notify.error(err.message ?? "Could not save the scheme.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted">Loading the adopted scheme…</p>;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-strong">Administration</h2>
        <p className="mt-1 text-sm text-muted">
          The selection is kept against the administration that made it. Naming a new one
          closes the current selection and starts a fresh record, so what a previous
          administration ran on stays readable.
        </p>
        <input
          value={tenure}
          onChange={(e) => setTenure(e.target.value)}
          readOnly={!isAdmin}
          placeholder="e.g. Prof. A. Balogun, 2026-2030"
          className="mt-4 block w-full max-w-md rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-pes-400"
        />
        {active && (
          <p className="mt-2 text-xs text-muted">
            Currently in force: <strong>{active.tenure}</strong>, adopted{" "}
            {new Date(active.created_at).toLocaleDateString()}.
          </p>
        )}
      </section>

      {MOTIVATOR_GROUPS.map((group) => (
        <section key={group.key} className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-strong">{group.title}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {group.items.map((item) => {
              const compulsory = Boolean(item.compulsory);
              return (
                <label
                  key={item.key}
                  className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                    compulsory ? "border-pes-200 bg-pes-50" : "border-line"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(item.key)}
                    disabled={compulsory || !isAdmin}
                    onChange={() => toggle(item.key)}
                    className="mt-0.5"
                  />
                  <span className="text-body">
                    {item.label}
                    {compulsory && (
                      <span className="ml-2 text-xs font-medium text-pes-700">compulsory</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>

          {group.allowsAdditions && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted">
                The document leaves room for the establishment's own additions here.
              </p>
              <ul className="mt-2 space-y-1">
                {additions.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-body">
                    <span>• {a}</span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setAdditions((prev) => prev.filter((x) => x !== a))}
                        className="text-xs text-danger-700 underline"
                      >
                        remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {isAdmin && (
                <div className="mt-2 flex gap-2">
                  <input
                    value={newAddition}
                    onChange={(e) => setNewAddition(e.target.value)}
                    placeholder="Add an item of your own"
                    className="block w-full max-w-sm rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-pes-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const value = newAddition.trim();
                      if (!value) return;
                      setAdditions((prev) => Array.from(new Set([...prev, value])));
                      setNewAddition("");
                    }}
                    className="rounded-md border border-pes px-3 py-2 text-xs font-medium text-pes hover:bg-pes-50"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      ))}

      {isAdmin ? (
        <div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className={`rounded-lg px-6 py-3 text-sm font-medium text-white ${
              saving ? "cursor-not-allowed bg-gray-400" : "bg-pes hover:opacity-90"
            }`}
          >
            {saving ? "Saving…" : "Save adopted scheme"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted">
          The adopted scheme is set by the organization admin on behalf of top management.
        </p>
      )}

      {past.length > 0 && (
        <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-strong">Previous administrations</h2>
          <ul className="mt-3 space-y-2 text-sm text-body">
            {past.map((p) => (
              <li key={p.id}>
                <strong>{p.tenure}</strong> — {(p.selections ?? []).length} motivators,{" "}
                {new Date(p.created_at).toLocaleDateString()} to{" "}
                {p.closed_at ? new Date(p.closed_at).toLocaleDateString() : "—"}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function ActionSchemeTab() {
  const scheme = actionScheme();
  return (
    <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-strong">Motivation Action Scheme</h2>
      <p className="mt-1 text-sm text-muted">
        Performance level against period, as the document sets it out. A blank cell is
        blank there too.
      </p>
      <div className="mt-5 overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-canvas font-medium text-body">
            <tr>
              <th className="px-4 py-2">Performance level</th>
              {PERIODS.map((p) => (
                <th key={p.key} className="px-4 py-2">
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {PERFORMANCE_LEVELS.map((level) => {
              const disciplinary = ["Very Poor", "Poor", "Fair"].includes(level);
              return (
                <tr key={level} className={disciplinary ? "bg-warning-50/40" : undefined}>
                  <td className="px-4 py-3 font-semibold text-strong">{level}</td>
                  {PERIODS.map((p) => {
                    const actions = scheme[level]?.[p.key] ?? [];
                    return (
                      <td key={p.key} className="px-4 py-3 align-top text-body">
                        {actions.length === 0 ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <ul className="list-inside list-disc">
                            {actions.map((a) => (
                              <li key={a}>{a}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

function EntitlementTab() {
  const [level, setLevel] = useState<PerformanceLevel>("Very Good");
  const [period, setPeriod] = useState<Period>("annual");
  const [percentage, setPercentage] = useState<number | "">("");
  const [adopted, setAdopted] = useState<string[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/motivation-scheme", { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();
        setAdopted(data.active?.selections ?? null);
      } catch {
        /* falls back to the compulsory motivators only */
      }
    })();
  }, []);

  const entitlement = useMemo(
    () => entitlementFor(level, period, adopted),
    [level, period, adopted],
  );

  const labelFor = (key: string) => {
    for (const g of MOTIVATOR_GROUPS) {
      const found = g.items.find((i) => i.key === key);
      if (found) return found.label;
    }
    return key;
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-strong">What a grade earns</h2>
        <p className="mt-1 text-sm text-muted">
          Pick the grade and the period, or type an overall percentage and let the
          classification scheme name the grade.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-semibold text-body">
            Performance level
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as PerformanceLevel)}
              className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-pes-400"
            >
              {PERFORMANCE_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-body">
            Period
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-pes-400"
            >
              {PERIODS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-body">
            Or an overall percentage
            <input
              type="number"
              value={percentage}
              onChange={(e) => {
                const v = e.target.value === "" ? "" : Number(e.target.value);
                setPercentage(v);
                if (v !== "" && Number.isFinite(v)) setLevel(levelFromPercentage(Number(v)));
              }}
              className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-pes-400"
            />
          </label>
        </div>
      </section>

      <section
        className={`rounded-xl border p-6 shadow-sm ${
          entitlement.disciplinary
            ? "border-warning-200 bg-warning-50"
            : "border-line bg-white"
        }`}
      >
        <h3 className="text-sm font-semibold text-strong">
          {entitlement.disciplinary ? "Action due" : "Award due"} — {level},{" "}
          {PERIODS.find((p) => p.key === period)?.label.toLowerCase()}
        </h3>

        {entitlement.actions.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            The scheme leaves this cell blank: nothing is due at this level for this period.
          </p>
        ) : (
          <ul className="mt-3 list-inside list-disc text-sm text-body">
            {entitlement.actions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}

        {entitlement.certificateClass && (
          <div className="mt-5">
            <p className="text-sm font-semibold text-body">
              Achievement certificates — {entitlement.certificateClass}
            </p>
            <p className="mt-1 text-xs text-muted">
              Issued for the parameters the staff member earned them in:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CERTIFICATE_TYPES.map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-line bg-canvas px-2.5 py-1 text-xs text-body"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {entitlement.motivators.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold text-body">
              From the motivators this administration adopted
            </p>
            <ul className="mt-2 list-inside list-disc text-sm text-body">
              {entitlement.motivators.map((k) => (
                <li key={k}>{labelFor(k)}</li>
              ))}
            </ul>
          </div>
        )}

        {adopted == null && (
          <p className="mt-5 text-xs text-warning-700">
            No scheme has been adopted yet, so only the compulsory motivators are counted.
            Set one on the first tab.
          </p>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------

function AwardRecordTab() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === "admin" || user?.role === "super-admin";

  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    staff_name: "",
    dept: "",
    period: "annual" as Period,
    period_label: String(new Date().getFullYear()),
    level: "Very Good" as PerformanceLevel,
    motivator: "",
    detail: "",
    cash_amount: "" as number | "",
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await apiFetch("/api/motivation-awards", { method: "GET" });
      if (!res.ok) return;
      setAwards(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function record() {
    if (!form.staff_name.trim() || !form.motivator.trim()) {
      notify.error("A staff name and what was awarded are both needed.");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch("/api/motivation-awards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not record the award.");
      notify.success("Award recorded.");
      setForm((f) => ({ ...f, staff_name: "", motivator: "", detail: "", cash_amount: "" }));
      load();
    } catch (err: any) {
      notify.error(err.message ?? "Could not record the award.");
    } finally {
      setSaving(false);
    }
  }

  const field =
    "mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-pes-400";

  return (
    <div className="flex flex-col gap-6">
      {isAdmin && (
        <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-strong">Record an award</h2>
          <p className="mt-1 text-sm text-muted">
            The document requires that every award given, and who received it, is on record
            for the year.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold text-body">
              Staff name
              <input
                value={form.staff_name}
                onChange={(e) => setForm((f) => ({ ...f, staff_name: e.target.value }))}
                className={field}
              />
            </label>
            <label className="text-sm font-semibold text-body">
              Department
              <input
                value={form.dept}
                onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))}
                className={field}
              />
            </label>
            <label className="text-sm font-semibold text-body">
              Period
              <select
                value={form.period}
                onChange={(e) => setForm((f) => ({ ...f, period: e.target.value as Period }))}
                className={field}
              >
                {PERIODS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-body">
              Period label
              <input
                value={form.period_label}
                onChange={(e) => setForm((f) => ({ ...f, period_label: e.target.value }))}
                placeholder="2026, Q1 2026, …"
                className={field}
              />
            </label>
            <label className="text-sm font-semibold text-body">
              Performance level
              <select
                value={form.level}
                onChange={(e) =>
                  setForm((f) => ({ ...f, level: e.target.value as PerformanceLevel }))
                }
                className={field}
              >
                {PERFORMANCE_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-body">
              What was awarded
              <input
                value={form.motivator}
                onChange={(e) => setForm((f) => ({ ...f, motivator: e.target.value }))}
                placeholder="1st class Certificate of Competence"
                className={field}
              />
            </label>
            <label className="text-sm font-semibold text-body sm:col-span-2">
              Detail
              <input
                value={form.detail}
                onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
                className={field}
              />
            </label>
            <label className="text-sm font-semibold text-body">
              Cash accompanying it
              <input
                type="number"
                value={form.cash_amount}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    cash_amount: e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
                className={field}
              />
            </label>
          </div>
          <button
            type="button"
            onClick={record}
            disabled={saving}
            className={`mt-5 rounded-lg px-6 py-3 text-sm font-medium text-white ${
              saving ? "cursor-not-allowed bg-gray-400" : "bg-pes hover:opacity-90"
            }`}
          >
            {saving ? "Recording…" : "Record award"}
          </button>
        </section>
      )}

      <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-strong">Awards given</h2>
        {loading ? (
          <p className="mt-3 text-sm text-muted">Loading the record…</p>
        ) : awards.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing has been awarded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas font-medium text-body">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Staff</th>
                  <th className="px-4 py-2">Period</th>
                  <th className="px-4 py-2">Level</th>
                  <th className="px-4 py-2">Award</th>
                  <th className="px-4 py-2">Cash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {awards.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-muted">
                      {new Date(a.awarded_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 font-medium text-strong">
                      {a.staff_name}
                      {a.dept && <span className="ml-1 text-xs text-muted">({a.dept})</span>}
                    </td>
                    <td className="px-4 py-2 text-body">{a.period_label}</td>
                    <td className="px-4 py-2 text-body">{a.level}</td>
                    <td className="px-4 py-2 text-body">
                      {a.motivator}
                      {a.detail && <span className="block text-xs text-muted">{a.detail}</span>}
                    </td>
                    <td className="px-4 py-2 text-body">
                      {a.cash_amount == null ? "—" : Number(a.cash_amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs text-muted">
          Certificates and badges are printed from the{" "}
          <Link href="/reward/badges/staff" className="text-pes underline">
            reward pages
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
