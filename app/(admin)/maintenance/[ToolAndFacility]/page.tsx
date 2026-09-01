"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "iconsax-react";
import Link from "next/link";
import { apiFetch } from "@/app/utils/apiFetch";
import { notify } from "@/lib/toast";
import { planMaintenance } from "@/app/lib/maintenance/schedule";
import { mayRunMaintenance, isOrgAdmin } from "@/app/lib/maintenance/team";
import { useCurrentUser } from "@/app/components/useCurrentUser";

interface HomeProps {
  params: {
    ToolAndFacility: string;
  };
}

export default function MaintenanceDetail({ params }: HomeProps) {
  const facilityName = decodeURIComponent(params.ToolAndFacility);

  // The client asked for every field on these sheets to carry data, so he can
  // see the maintenance model working end to end without first inventing a
  // machine's history. These are worked sample figures for one facility over a
  // year: 8,760 operating hours, six failures, and a maintenance plan against
  // them. They are ordinary editable values — typing over one replaces it — and
  // the banner says plainly that they are samples.
  const SAMPLE_DATA: Record<string, Record<string, number>> = {
    "Time taken to Failure": { totalTime: 8760, numFailures: 6 },
    "Maintenance Schedule Card": { plannedHours: 4, plannedFreq: 52 },
    "Job Report Card": { totalHours: 186, costPerHour: 4500 },
    "Weekly Maintenance Plan": { completed: 47, scheduled: 52 },
    "Job Specification Sheet": { stdHours: 3.5, actualJobHours: 4.2 },
    "Critical Examination Sheet": { reliability: 0.92, criticality: 1.4 },
    "History Record Card": { downtimeHours: 214, totalOperatingHours: 8760 },
  };

  const [formData, setFormData] = useState<Record<string, any>>(SAMPLE_DATA);
  const [usingSample, setUsingSample] = useState(true);
  const [results, setResults] = useState<Record<string, number>>({});
  // The maintenance head picks the day the first visit falls on; everything
  // after it is spaced by the computed interval.
  const [startsOn, setStartsOn] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [saving, setSaving] = useState(false);

  // The model belongs to the maintenance team. The organization admin may open
  // it and read it, but not conduct a run or save a plan: the client's rule is
  // that the schedule is set by whoever is standing next to the machine.
  const { user } = useCurrentUser();
  const mayRun = mayRunMaintenance(user?.role);
  const admin = isOrgAdmin(user?.role);
  const [heads, setHeads] = useState<{ name: string; dept: string | null }[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/maintenance-head", { method: "GET" });
        if (!res.ok) return;
        const body = await res.json();
        setHeads(body.heads ?? []);
      } catch {
        /* the notice below simply does not appear */
      }
    })();
  }, []);

  const plan = useMemo(() => {
    if (!results.interval || !results.totalPlannedHours) return null;
    return planMaintenance(results.interval, results.totalPlannedHours, startsOn);
  }, [results.interval, results.totalPlannedHours, startsOn]);

  async function saveRun() {
    if (Object.keys(results).length === 0) return;
    setSaving(true);
    try {
      const res = await apiFetch("/api/maintenance-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facility: facilityName,
          inputs: formData,
          results,
          optimal_interval: results.interval,
          planned_hours: results.totalPlannedHours,
          cycles: plan?.cycles ?? null,
          days_between: plan?.daysBetween ?? null,
          starts_on: plan ? startsOn : null,
          schedule: plan?.dates ?? [],
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not save this run.");
      notify.success("Saved. It is on the history page with its planned dates.");
    } catch (err: any) {
      notify.error(err.message ?? "Could not save this run.");
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (sheet: string, field: string, value: string) => {
    setUsingSample(false);
    setFormData((prev) => ({
      ...prev,
      [sheet]: { ...prev[sheet], [field]: parseFloat(value) || 0 },
    }));
  };

  const clearAll = () => {
    setUsingSample(false);
    setFormData({});
    setResults({});
  };

  const calculateModel = () => {
    const timeToFailure = formData["Time taken to Failure"]?.totalTime || 0;
    const numFailures = formData["Time taken to Failure"]?.numFailures || 0;
    const reliability =
      formData["Critical Examination Sheet"]?.reliability || 0;
    const criticality =
      formData["Critical Examination Sheet"]?.criticality || 1;
    const totalHours = formData["Job Report Card"]?.totalHours || 0;
    const costPerHour = formData["Job Report Card"]?.costPerHour || 0;
    const plannedHours =
      formData["Maintenance Schedule Card"]?.plannedHours || 0;
    const plannedFreq = formData["Maintenance Schedule Card"]?.plannedFreq || 0;
    const completedTasks = formData["Weekly Maintenance Plan"]?.completed || 0;
    const scheduledTasks = formData["Weekly Maintenance Plan"]?.scheduled || 0;
    const stdHours = formData["Job Specification Sheet"]?.stdHours || 0;
    const actualJobHours =
      formData["Job Specification Sheet"]?.actualJobHours || 0;
    const downtimeHours = formData["History Record Card"]?.downtimeHours || 0;
    const totalOperatingHours =
      formData["History Record Card"]?.totalOperatingHours || 0;

    // Calculations from PDF
    const mtbf = numFailures > 0 ? timeToFailure / numFailures : 0;
    const interval =
      mtbf && criticality ? (mtbf * reliability) / criticality : 0;
    const cost = totalHours * costPerHour;
    const totalPlannedHours = plannedHours * plannedFreq;
    const compliance =
      scheduledTasks > 0 ? (completedTasks / scheduledTasks) * 100 : 0;
    const variance = actualJobHours - stdHours;
    const downtimePercent =
      totalOperatingHours > 0 ? (downtimeHours / totalOperatingHours) * 100 : 0;

    setResults({
      mtbf,
      interval,
      cost,
      totalPlannedHours,
      compliance,
      variance,
      downtimePercent,
    });
  };

  const sheets = [
    { name: "Time taken to Failure", fields: ["totalTime", "numFailures"] },
    { name: "General Facility Register", fields: [] },
    {
      name: "Maintenance Schedule Card",
      fields: ["plannedHours", "plannedFreq"],
    },
    { name: "Job Report Card", fields: ["totalHours", "costPerHour"] },
    { name: "Machine Register Card", fields: [] },
    { name: "Weekly Maintenance Plan", fields: ["completed", "scheduled"] },
    { name: "Job Specification Sheet", fields: ["stdHours", "actualJobHours"] },
    {
      name: "Critical Examination Sheet",
      fields: ["reliability", "criticality"],
    },
    {
      name: "History Record Card",
      fields: ["downtimeHours", "totalOperatingHours"],
    },
  ];

  return (
    <div className="min-h-screen w-full bg-canvas flex justify-center items-center">
      <div className="bg-white shadow-md rounded-lg w-[95%]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            <Link href="/maintenance">
              <ArrowLeft className="me-4" />
            </Link>
            <h1 className="text-xl font-semibold">{facilityName}</h1>
          </div>
        </div>

        {/* Who this model belongs to, and what to do when nobody holds it. */}
        {admin && (
          <div className="mx-4 mt-4 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3">
            <p className="text-sm font-medium text-warning-700">
              This model is run by the maintenance team, not by the organization admin.
            </p>
            <p className="mt-1 text-sm text-warning-700">
              Maintenance is carried out at the production floor, and the schedule is set by
              the engineers, technologists and technicians who monitor the machine. You can
              read this page and its history, but conducting a run and saving a plan is
              theirs.
              {heads && heads.length === 0 && (
                <>
                  {" "}
                  <strong>
                    No maintenance head has been appointed yet, so nobody can run it.
                  </strong>{" "}
                  Add an employee with the role “Faculty / Division Head” in the employee
                  database, and the model becomes theirs to use.
                </>
              )}
            </p>
          </div>
        )}

        {!admin && heads && heads.length === 0 && (
          <div className="mx-4 mt-4 rounded-lg border border-line bg-canvas px-4 py-3">
            <p className="text-sm text-body">
              No maintenance head has been appointed for this organization yet. You can
              still conduct and save runs; ask your administrator to appoint one so the
              schedule has an owner.
            </p>
          </div>
        )}

        {usingSample && (
          <div className="mx-4 mt-4 flex items-center justify-between gap-4 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3">
            <p className="text-sm text-warning-700">
              These sheets are filled with <strong>sample figures</strong> — one facility
              over a year of 8,760 operating hours — so the model can be seen working.
              Type over any field to use your own, or clear them all.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="shrink-0 rounded-md border border-warning-200 px-3 py-1.5 text-xs font-medium text-warning-700 hover:bg-warning-100"
            >
              Clear sheets
            </button>
          </div>
        )}

        {/* Forms */}
        <div className="p-4">
          {sheets.map((sheet, index) => (
            <div key={index} className="mb-4 border rounded">
              <details className="p-3" open={false}>
                <summary className="cursor-pointer font-medium">
                  {sheet.name}
                </summary>
                {sheet.fields.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {sheet.fields.map((field) => (
                      <div key={field}>
                        <label className="block text-sm capitalize">
                          {field}
                        </label>
                        <input
                          type="number"
                          className="border rounded p-2 w-full"
                          value={formData[sheet.name]?.[field] ?? ""}
                          onChange={(e) =>
                            handleChange(sheet.name, field, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mt-2">
                    No direct inputs required for calculations.
                  </p>
                )}
              </details>
            </div>
          ))}
        </div>

        <button
          onClick={() =>
            mayRun
              ? calculateModel()
              : notify.error(
                  "The maintenance team conducts this model. Ask the maintenance head to run it.",
                )
          }
          aria-disabled={!mayRun}
          className={`m-4 flex items-center rounded px-4 py-2 text-white ${
            mayRun ? "bg-pes" : "bg-gray-400 opacity-70"
          }`}
        >
          Conduct P.M Model
        </button>

        {/* Results */}
        {Object.keys(results).length > 0 && (
          <div className="p-4 border-t bg-canvas">
            <h2 className="font-semibold mb-2">Results:</h2>
            <p>MTBF: {results.mtbf?.toFixed(2)} hours</p>
            <p>
              Optimal Maintenance Interval: {results.interval?.toFixed(2)} hours
            </p>
            <p>Total Maintenance Cost: ₦{results.cost?.toFixed(2)}</p>
            <p>
              Planned Maintenance Hours: {results.totalPlannedHours?.toFixed(2)}{" "}
              hrs
            </p>
            <p>Weekly Compliance: {results.compliance?.toFixed(2)}%</p>
            <p>Job Variance: {results.variance?.toFixed(2)} hrs</p>
            <p>Downtime: {results.downtimePercent?.toFixed(2)}%</p>
          </div>
        )}

        {/* The preventive maintenance plan, from the client's sketch: the
            optimal interval over the planned hours gives the number of visits,
            the planned hours over twenty-four gives the days between them, and
            a chosen start date turns that into dates. */}
        {plan && (
          <div className="border-t p-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-semibold text-strong">Preventive maintenance plan</h2>
                <p className="mt-1 text-sm text-muted">
                  {results.interval?.toFixed(2)} ÷ {results.totalPlannedHours?.toFixed(2)} ={" "}
                  {plan.exactCycles.toFixed(2)}, so <strong>{plan.cycles} maintenance
                  cycles</strong>. {results.totalPlannedHours?.toFixed(2)} hours ÷ 24 ={" "}
                  {plan.exactDays.toFixed(2)}, so one every{" "}
                  <strong>{plan.daysBetween} days</strong>.
                </p>
              </div>
              <label className="text-sm font-semibold text-body">
                First maintenance day
                <input
                  type="date"
                  value={startsOn}
                  onChange={(e) => setStartsOn(e.target.value)}
                  className="mt-1.5 block rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-pes-400"
                />
              </label>
            </div>

            {/* The loops of the sketch, in order, ending where the last cycle
                falls rather than running on. */}
            <ol className="mt-5 flex flex-wrap items-center gap-2">
              {plan.dates.map((d, i) => (
                <li key={d} className="flex items-center gap-2">
                  <div className="rounded-xl border-2 border-pes-200 bg-pes-50 px-4 py-3 text-center">
                    <p className="text-xs font-medium text-pes-700">Cycle {i + 1}</p>
                    <p className="text-sm font-bold text-pes">
                      {new Date(d).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-[11px] text-pes-700">
                      {results.totalPlannedHours?.toFixed(0)} hrs
                    </p>
                  </div>
                  {i < plan.dates.length - 1 && (
                    <span className="text-lg text-muted" aria-hidden>
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>

            <p className="mt-3 text-sm text-body">
              Starting {new Date(plan.dates[0]).toLocaleDateString()}, the {plan.cycles}{" "}
              cycles complete on{" "}
              <strong>{new Date(plan.dates[plan.dates.length - 1]).toLocaleDateString()}</strong>.
              The plan stops there.
            </p>
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-t p-4">
            <button
              type="button"
              onClick={() =>
                mayRun
                  ? saveRun()
                  : notify.error(
                      "The maintenance team saves this plan. Ask the maintenance head to save it.",
                    )
              }
              aria-disabled={!mayRun}
              disabled={saving}
              className={`rounded px-6 py-2 text-sm font-medium text-white ${
                saving || !mayRun ? "bg-gray-400 opacity-70" : "bg-pes hover:opacity-90"
              }`}
            >
              {saving ? "Saving…" : "Save result and plan"}
            </button>
            <Link href="/maintenance/history" className="text-sm text-pes underline">
              View history
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
