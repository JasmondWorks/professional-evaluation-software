"use client";

import { notify } from "@/lib/toast";
import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { factors } from "@/app/lib/stress/scoring";
import { CategoryValues } from "@/app/lib/stress/scoring";
import { RESET_MESSAGE } from "@/app/lib/stress/sessions";
import { useActiveCycle } from "@/app/components/useActiveCycle";
import { orgTerms } from "@/app/lib/orgTerms";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Link from "next/link";
import { ArrowLeft2, Calculator, Chart2, Save2, DocumentText, Warning2 } from "iconsax-react";
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";

const generateNormalCurve = (mean = 50, stdDev = 15) => {
  const data = [];
  const peak = 1 / (stdDev * Math.sqrt(2 * Math.PI));

  for (let y = 0; y <= 100; y += 0.5) {
    const pdf =
      (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * ((y - mean) / stdDev) ** 2);
    data.push({ y, density: (pdf / peak) * 100 });
  }

  return data;
};

const mean = (arrayData: number[]) => {
  if (arrayData.length === 0) return 0;
  const sum = arrayData.reduce((acc, current) => acc + current, 0);
  return sum / arrayData.length;
};

interface StressEntry {
  id: number;
  user_name: string;
  org: string;
  dept: string;
  faculty?: string;
  organizational: number;
  student: number;
  administrative: number;
  negative_public_attitude: number;
  teacher: number;
  parents: number;
  occupational: number;
  academic_program: number;
  personal: number;
  misc: number;
}

interface GroupedData {
  [group: string]: number[];
}

const computeANOVA = (groups: GroupedData) => {
  const allValues = Object.values(groups).flat();
  const overallMean = mean(allValues);
  const n = allValues.length;
  const k = Object.keys(groups).length;
  const ssto = allValues.reduce((sum, v) => sum + Math.pow(v - overallMean, 2), 0);
  let sstr = 0;
  Object.keys(groups).forEach((g) => {
    const groupMean = mean(groups[g]);
    sstr += groups[g].length * Math.pow(groupMean - overallMean, 2);
  });
  const sse = ssto - sstr;
  const dfBetween = k - 1;
  const dfWithin = n - k;
  const msBetween = sstr / dfBetween;
  const msWithin = sse / dfWithin;
  const fStatistic = msBetween / msWithin;
  const criticalValue = 2.89;

  const conclusion =
    fStatistic > criticalValue
      ? "Reject H₀ — significant differences between groups."
      : "Accept H₀ — no significant difference between groups.";

  return { fStatistic, criticalValue, conclusion };
};

export default function StressAnalysisTool() {
  const [activeTab, setActiveTab] = useState<"analysis" | "results">("analysis");
  const [stressData, setStressData] = useState<StressEntry[]>([]);
  const [dataCycle, setDataCycle] = useState<{ id: number; created_at: string; phase?: string } | null>(null);
  const [anovaResult, setAnovaResult] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const terms = orgTerms(category);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningSetting, setRunningSetting] = useState(false);
  const [settingLimits, setSettingLimits] = useState<Record<string, number> | null>(null);
  const [settingMsg, setSettingMsg] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewLocked, setPreviewLocked] = useState(false);
  const [feelingClosesAt, setFeelingClosesAt] = useState("");
  const [cycleWindows, setCycleWindows] = useState({
    settingsOpensAt: "",
    settingsClosesAt: "",
    feelingOpensAt: "",
    feelingClosesAt: "",
  });
  const [startingCycle, setStartingCycle] = useState(false);
  const [cycleMsg, setCycleMsg] = useState<string | null>(null);
  // What shape the next cycle will take (full vs feeling-only), and the admin's
  // option to force a full re-collection of Form 5.
  const [nextMode, setNextMode] = useState<{ willBeFull: boolean; hasSetting: boolean; needsReset: boolean } | null>(null);
  const [forceSettings, setForceSettings] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<any>(null);
  const [themeReport, setThemeReport] = useState<any>(null);
  const { data: cycleStatus, refetch: refetchCycle } = useActiveCycle();
  const [closing, setClosing] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [opening, setOpening] = useState(false);
  const [ending, setEnding] = useState(false);
  const [approvingUnit, setApprovingUnit] = useState<string | null>(null);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyCycles, setHistoryCycles] = useState<any[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = getAccessToken();
      const res = await apiFetch('/api/stress/sessions-history', { headers: { Authorization: `Bearer ${token}` }});
      const data = await res.json();
      setHistoryCycles(data.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (settingsModalOpen) {
      fetchHistory();
    }
  }, [settingsModalOpen]);

  const postCycleAction = async (endpoint: string, setBusy: (b: boolean) => void) => {
    setBusy(true);
    try {
      const token = getAccessToken();
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      setCycleMsg(data.message);
      refetchCycle();
    } catch (e) {
      setCycleMsg(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };
  const handleCloseWindow = () => postCycleAction("/api/stress/close-window", setClosing);
  const handleReopenWindow = () => postCycleAction("/api/stress/reopen-window", setReopening);
  const handleOpenWindow = () => postCycleAction("/api/stress/open-window", setOpening);
  const handleEndCycle = () => {
    if (!window.confirm("End this stress cycle now? This closes it off for the whole organization and lets you start a new one. If you haven't evaluated it, no results will be saved for this cycle.")) return;
    postCycleAction("/api/stress/end-cycle", setEnding);
  };

  const refetchApproval = () => {
    const token = getAccessToken();
    apiFetch("/api/stress/org-approval-status", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setApprovalStatus)
      .catch(() => {});
  };
  // Admin override: approve a department/faculty directly (e.g. when it has no
  // head, so tiered approval can't happen and evaluation would be stuck).
  const handleAdminApprove = async (group: "departments" | "faculties", name: string) => {
    const key = `${group}:${name}`;
    setApprovingUnit(key);
    try {
      const token = getAccessToken();
      const res = await apiFetch("/api/stress/admin-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(group === "departments" ? { dept: name } : { faculty: name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve");
      refetchApproval();
    } catch (e) {
      notify.error(e instanceof Error ? e.message :"Failed to approve");
    } finally {
      setApprovingUnit(null);
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    const auth = { headers: { Authorization: `Bearer ${token}` } };
    apiFetch("/api/stress/org-approval-status", auth)
      .then((r) => r.json())
      .then((d) => setApprovalStatus(d))
      .catch(() => {});
    apiFetch("/api/stress/theme-report", auth)
      .then((r) => r.json())
      .then((d) => setThemeReport(d))
      .catch(() => {});
    apiFetch("/api/stress/next-cycle-mode", auth)
      .then((r) => r.json())
      .then((d) => { if (d && typeof d.willBeFull === "boolean") setNextMode(d); })
      .catch(() => {});
  }, []);
  const [msg, setMsg] = useState<{type: "success" | "error", text: string} | null>(null);

  useEffect(() => {
    async function fetchData() {
      const token = getAccessToken();
      if (!token) return;

      try {
        const decoded: any = jwt.decode(token);
        setRole(decoded?.role || null);
        setCategory(decoded?.productCategory ?? decoded?.category ?? null);

        const res = await apiFetch("/api/getStressDataScores", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({}),
        });
        const payload = await res.json();
        // Endpoint now returns { rows, cycle } (scoped to the effective cycle).
        // Tolerate the old array shape just in case.
        const rows = Array.isArray(payload) ? payload : (payload?.rows ?? []);
        setStressData(rows);
        if (!Array.isArray(payload) && payload?.cycle) setDataCycle(payload.cycle);

        // Hydrate the last SAVED evaluation so the "Evaluation Results" tab stays
        // available after navigating away and back (e.g. from History), instead
        // of disabling until ANOVA is re-run. Factors are stored as 0–100.
        try {
          const evalRes = await apiFetch("/api/getStressEvaluation", {
            cache: "no-store",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (evalRes.ok) {
            const runs = await evalRes.json();
            const latest = Array.isArray(runs) ? runs[0] : null;
            if (latest) {
              setSummary({
                stress: Number(latest.stress_factor ?? latest.f_statistic ?? 0), // fallback for shape changes
                pressure: Number(latest.pressure_factor ?? 0),
                conflict: Number(latest.conflict_factor ?? 0),
                generatedAt: latest.created_at ?? null,
                needsReset: payload?.cycle?.needs_reset ?? false,
              });
              if (latest.anova_result || latest.conclusion) {
                try {
                  setAnovaResult(latest.anova_result ? JSON.parse(latest.anova_result) : { conclusion: latest.conclusion });
                } catch {
                  /* ignore malformed stored anova */
                }
              }
            }
          }
        } catch {
          /* non-fatal — Results tab simply stays gated until ANOVA is run */
        }
      } catch (e) {
        console.error("Failed to load stress data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const isAdmin = role === "super-admin" || role === "admin";
  // "In session" = a cycle exists and hasn't been evaluated yet. The live panels
  // (cycle status, submission/approval, theme report, run setting, run ANOVA) are
  // only meaningful then; otherwise we show the Start Cycle card + a clear notice.
  const inSession = !!cycleStatus?.active && cycleStatus.phase !== "evaluated";

  const enrichedData = stressData.map((s) => {
    // Category values come from Form 5 (stress_scores). The scoring module turns
    // them into the three 0–100 factors — one place, no hardcoded divisors.
    const values: CategoryValues = {
      organizational: Number(s.organizational),
      student: Number(s.student),
      administrative: Number(s.administrative),
      teacher: Number(s.teacher),
      parents: Number(s.parents),
      occupational: Number(s.occupational),
      personal: Number(s.personal),
      academic_program: Number(s.academic_program),
      negative_public_attitude: Number(s.negative_public_attitude),
      misc: Number(s.misc),
    };
    const f = factors(values);
    return {
      ...s,
      stressFactor: f.stress,
      pressureFactor: f.pressure,
      conflictFactor: f.conflict,
    };
  });

  // Aggregate the per-staff factors up to a grouping level (department, faculty,
  // or the whole institution). The client requires ONLY these grouped levels —
  // no individual results are shown or saved.
  type LevelRow = {
    name: string;
    count: number;
    stress: number;
    pressure: number;
    conflict: number;
  };
  const aggregateBy = (keyFn: (e: (typeof enrichedData)[number]) => string): LevelRow[] => {
    const groups: Record<string, typeof enrichedData> = {};
    enrichedData.forEach((e) => {
      const key = keyFn(e) || "Unknown";
      (groups[key] ||= []).push(e);
    });
    return Object.entries(groups)
      .map(([name, rows]) => ({
        name,
        count: rows.length,
        stress: mean(rows.map((r) => r.stressFactor)),
        pressure: mean(rows.map((r) => r.pressureFactor)),
        conflict: mean(rows.map((r) => r.conflictFactor)),
      }))
      .sort((a, b) => b.stress - a.stress);
  };
  // DEPARTMENT = mean of its staff (the base level).
  const departmentResults = aggregateBy((e) => e.dept);

  // Each department belongs to exactly one faculty.
  const facultyOfDept: Record<string, string> = {};
  enrichedData.forEach((e) => {
    const d = e.dept || "Unknown";
    if (!facultyOfDept[d]) facultyOfDept[d] = e.faculty || "Unknown Faculty";
  });

  // FACULTY = mean of its DEPARTMENTS' values (NOT mean of all staff). With a
  // single department in a faculty, the faculty value equals that department's.
  const facultyGroups: Record<string, LevelRow[]> = {};
  departmentResults.forEach((dr) => {
    const fac = facultyOfDept[dr.name] || "Unknown Faculty";
    (facultyGroups[fac] ||= []).push(dr);
  });
  const facultyResults: LevelRow[] = Object.entries(facultyGroups)
    .map(([name, depts]) => ({
      name,
      count: depts.reduce((s, d) => s + d.count, 0),
      stress: mean(depts.map((d) => d.stress)),
      pressure: mean(depts.map((d) => d.pressure)),
      conflict: mean(depts.map((d) => d.conflict)),
    }))
    .sort((a, b) => b.stress - a.stress);

  // ORGANIZATION = mean of its FACULTIES' values.
  const institutionResults: LevelRow[] = facultyResults.length
    ? [
        {
          name: "Whole Institution",
          count: facultyResults.reduce((s, f) => s + f.count, 0),
          stress: mean(facultyResults.map((f) => f.stress)),
          pressure: mean(facultyResults.map((f) => f.pressure)),
          conflict: mean(facultyResults.map((f) => f.conflict)),
        },
      ]
    : [];

  const runANOVA = () => {
    const grouped: GroupedData = {};
    enrichedData.forEach((e) => {
      if (!grouped[e.dept]) grouped[e.dept] = [];
      grouped[e.dept].push(e.stressFactor);
    });

    // ANOVA needs ≥2 groups and within-group degrees of freedom ≥1 (i.e. at
    // least one department with ≥2 staff). Otherwise variance is undefined and
    // the test is not applicable — we still report the stress values.
    const k = Object.keys(grouped).length;
    const N = enrichedData.length;
    const applicable = k >= 2 && N - k >= 1;
    setAnovaResult(
      applicable
        ? { ...computeANOVA(grouped), applicable: true }
        : { applicable: false, groups: k, staff: N },
    );

    // Overall organization figures = mean of the faculties (hierarchical),
    // not a flat mean over all staff.
    setSummary({
      stress: institutionResults[0]?.stress ?? 0,
      pressure: institutionResults[0]?.pressure ?? 0,
      conflict: institutionResults[0]?.conflict ?? 0,
      generatedAt: new Date().toISOString(),
      needsReset: undefined, // Unknown until saved
    });
    setActiveTab("results");
  };

  // #4: "Run ANOVA & Generate Report" is only available once a setting has been
  // computed (cycle past the settings phase) AND theme/feeling data collected.
  const settingComputed =
    !!cycleStatus &&
    ["feeling_open", "feeling_closed", "evaluated"].includes(cycleStatus.phase || "");
  const feelingCollected = !!themeReport?.active && (themeReport?.staffCount ?? 0) > 0;
  // All submitted theme/feeling responses must be approved (HOD → faculty) before
  // the org can be evaluated.
  const approvalDepts = approvalStatus?.departments ?? [];
  const totalSubmitted = approvalDepts.reduce((s: number, d: any) => s + (d.submitted ?? 0), 0);
  const totalPendingApproval = approvalDepts.reduce((s: number, d: any) => s + (d.pendingApproval ?? 0), 0);
  const allApproved = totalSubmitted > 0 && totalPendingApproval === 0;
  const canRunAnova =
    settingComputed && feelingCollected && allApproved && enrichedData.length > 0;
  const anovaBlockedReason = !settingComputed
    ? "Run the setting first (compute Form 5 limits and open Form 6/7)."
    : !feelingCollected
      ? "No theme/feeling responses have been collected yet."
      : enrichedData.length === 0
        ? "No Form 5 data available to evaluate."
        : !allApproved
          ? `Evaluation is locked until every submitted response is approved. ${totalPendingApproval} submission(s) are still awaiting ${approvalStatus?.academic ? `HOD / ${terms.head}` : "HOD"} approval.`
          : null;

  const handleStartCycle = async (overrideFull?: boolean) => {
    setStartingCycle(true);
    setCycleMsg(null);
    try {
      const token = getAccessToken();
      const res = await apiFetch("/api/stress/start-cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...cycleWindows,
          forceSettings: overrideFull ?? forceSettings,
          historyCycleId: selectedHistoryId
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start cycle");
      setCycleMsg(data.message || "Cycle started.");
      setSettingsModalOpen(false);
      refetchCycle();
    } catch (e) {
      setCycleMsg(e instanceof Error ? e.message : "Failed to start cycle");
    } finally {
      setStartingCycle(false);
    }
  };

  // "Run/Evaluate Setting": average Form 5 across staff into the per-category
  // limits that Form 6 will use, and store them on the org's stress cycle.
  const handleRunSetting = async () => {
    setRunningSetting(true);
    setSettingMsg(null);
    try {
      const token = getAccessToken();
      const res = await apiFetch("/api/stress/run-setting", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ feelingClosesAt: feelingClosesAt || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to run setting");
      setSettingLimits(data.limits);
      setSettingMsg(`Setting computed from ${data.staffCount} staff submission(s). Form 6/7 is now open${feelingClosesAt ? ` until ${new Date(feelingClosesAt).toLocaleString()}` : ""}.`);
    } catch (e) {
      setSettingMsg(e instanceof Error ? e.message : "Failed to run setting");
    } finally {
      setRunningSetting(false);
    }
  };

  // "View Form 5 results" — read-only, available at ANY phase. Shows the current
  // per-category limits (the stored ones once the setting is run, otherwise a
  // live mean of whatever Form 5 data exists) without changing the cycle.
  const handlePreviewSetting = async () => {
    setPreviewing(true);
    setSettingMsg(null);
    try {
      const token = getAccessToken();
      const res = await apiFetch("/api/stress/setting-preview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load Form 5 results");
      if (!data.active) {
        setSettingMsg("No active cycle to show Form 5 results for.");
        return;
      }
      setSettingLimits(data.limits || {});
      setPreviewLocked(!!data.locked);
      if (data.limitsSource === "loaded_from_history" || data.limitsSource === "inherited") {
        setSettingMsg("Limits loaded from a previous session (no new Form 5 submissions required).");
      } else {
        setSettingMsg(
          data.staffCount > 0
            ? `Form 5 results from ${data.staffCount} staff submission(s)${data.locked ? " (locked in by Run Setting)" : " (live preview — not yet locked in)"}.`
            : "No Form 5 submissions yet for this cycle."
        );
      }
    } catch (e) {
      setSettingMsg(e instanceof Error ? e.message : "Failed to load Form 5 results");
    } finally {
      setPreviewing(false);
    }
  };

  const handleSave = async () => {
    if (!summary) return;
    setSaving(true);
    setMsg(null);
    try {
      const token = getAccessToken();
      const res = await apiFetch("/api/saveStressEvaluation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          stress: summary.stress,
          pressure: summary.pressure,
          conflict: summary.conflict,
          anovaResult
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSummary((s: any) => ({ ...s, needsReset: data.needsReset }));
        setMsg({ type: "success", text: "Evaluation saved successfully!" });
      } else {
        setMsg({ type: "error", text: data.error || "Failed to save evaluation." });
      }
    } catch (e) {
      setMsg({ type: "error", text: "Network error when saving evaluation." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-pes border-t-transparent mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full mx-auto max-w-7xl">
      <div className="mb-4">
        <Link
          href="/models"
          className="inline-flex items-center text-sm text-muted hover:text-pes transition-colors"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Models
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Stress Evaluation Tool</h1>
          <p className="text-body mb-6 max-w-2xl">
            Analyze self-reported stress, pressure, and conflict factors across departments using ANOVA.
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && inSession && (
            <button
              onClick={handleEndCycle}
              disabled={ending}
              className="bg-white border border-danger-100 text-danger-700 shadow-sm px-4 py-2 rounded-md hover:bg-danger-50 font-medium text-sm transition-colors disabled:opacity-50"
            >
              {ending ? "Ending…" : "End cycle"}
            </button>
          )}
          <Link
            href="/models/stress/history"
            className="bg-white border border-line shadow-sm text-body px-4 py-2 rounded-md hover:bg-canvas font-medium text-sm transition-colors flex items-center gap-2"
          >
            <DocumentText size="16" />
            View History
          </Link>
        </div>
      </div>

      {/* Which cycle's Form 5 data these results are based on — so carried-over
          values from an earlier cycle are never confused with the current one. */}
      {dataCycle && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-pes-50 border border-pes-100 px-4 py-1.5 text-xs font-medium text-pes-700">
          Results based on stress cycle #{dataCycle.id}
          {dataCycle.created_at ? ` · started ${new Date(dataCycle.created_at).toLocaleDateString()}` : ""}
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-line print:hidden">
        <button
          onClick={() => setActiveTab("analysis")}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "analysis"
              ? "border-pes text-pes"
              : "border-transparent text-muted hover:text-body hover:border-line"
          }`}
        >
          Analysis Configuration
        </button>
        <button
          onClick={() => setActiveTab("results")}
          disabled={!summary}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "results"
              ? "border-pes text-pes"
              : "border-transparent text-muted hover:text-body hover:border-line disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          Evaluation Results
        </button>
      </div>

      {/* NO ACTIVE CYCLE notice */}
      {activeTab === "analysis" && isAdmin && !inSession && (
        <div className="mb-6 rounded-xl border border-line bg-canvas px-6 py-4 text-sm text-body">
          There is no active stress cycle at the moment. Start one below to open the forms and see submission, approval and report status here.
        </div>
      )}

      {/* CURRENT CYCLE STATUS + window controls */}
      {activeTab === "analysis" && isAdmin && inSession && (() => {
        const f5 = cycleStatus.form5;
        const f6 = cycleStatus.form6;
        // The one form that's currently in play, with its label + status.
        const inSettings = cycleStatus.phase === "settings_open" || cycleStatus.phase === "settings_closed";
        const form = inSettings ? f5 : f6;
        const label = inSettings ? "Form 5 (stress category)" : "Form 6/7 (themes & feeling)";
        const opensStr = form?.opensAt ? new Date(form.opensAt).toLocaleString() : null;
        const statusText =
          form?.status === "not_yet"
            ? `${label} — scheduled${opensStr ? `, opens ${opensStr}` : ""}`
            : form?.status === "open"
              ? `${label} — open, collecting responses`
              : `${label} — closed`;
        return (
          <div className="bg-white rounded-xl border border-line p-6 shadow-sm mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Current cycle phase</p>
              <p className="text-lg font-bold text-strong">{statusText}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {form?.status === "not_yet" && (
                <button onClick={handleOpenWindow} disabled={opening}
                  className="px-5 py-2.5 border border-green-200 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors disabled:opacity-50">
                  {opening ? "Opening…" : `Open ${inSettings ? "Form 5" : "Form 6/7"} now`}
                </button>
              )}
              {form?.status === "open" && (
                <button onClick={handleCloseWindow} disabled={closing}
                  className="px-5 py-2.5 border border-danger-100 text-danger-700 rounded-lg font-medium hover:bg-danger-50 transition-colors disabled:opacity-50">
                  {closing ? "Closing…" : `Close ${inSettings ? "Form 5" : "Form 6/7"} now`}
                </button>
              )}
              {(cycleStatus.phase === "settings_closed" || cycleStatus.phase === "feeling_closed") && (
                <button onClick={handleReopenWindow} disabled={reopening}
                  className="px-5 py-2.5 border border-line text-body rounded-lg font-medium hover:bg-canvas transition-colors disabled:opacity-50">
                  {reopening ? "Reopening…" : `Reopen ${inSettings ? "Form 5" : "Form 6/7"}`}
                </button>
              )}
              <button onClick={handleEndCycle} disabled={ending}
                title="Close this cycle off for the whole organization"
                className="px-5 py-2.5 border border-danger-100 text-danger-700 rounded-lg font-medium hover:bg-danger-50 transition-colors disabled:opacity-50">
                {ending ? "Ending…" : "End cycle"}
              </button>
            </div>
          </div>
        );
      })()}

      {/* START CYCLE (admin) — only when no cycle is in session */}
      {activeTab === "analysis" && isAdmin && !inSession && (
        <div className="bg-white rounded-xl border border-line p-8 shadow-sm mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-strong">Start a Stress Cycle</h2>
            <p className="text-sm text-muted max-w-2xl mt-1">
              Open a new stress exercise for your organization. Only one cycle can run at a time.
            </p>
          </div>
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="px-6 py-3 bg-pes text-white rounded-lg hover:bg-pes-800 transition-colors font-medium shadow-sm"
          >
            Manage stress settings
          </button>
        </div>
      )}

      {/* SETTINGS MODAL */}
      <Dialog open={settingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Stress Settings</DialogTitle>
            <DialogDescription>
              Choose how you want to configure the limits for this stress cycle.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-canvas border border-line rounded-xl p-5 hover:border-pes hover:shadow-sm transition-all cursor-pointer" onClick={() => setSelectedHistoryId(null)}>
              <div className="flex items-center gap-3 mb-2">
                <input type="radio" checked={selectedHistoryId === null} onChange={() => setSelectedHistoryId(null)} className="w-4 h-4 text-pes" />
                <h3 className="font-bold text-strong">Start from scratch</h3>
              </div>
              <p className="text-sm text-muted ml-7">
                Open Form 5 to collect stress setting data from staff, then run the setting to lock in limits.
              </p>
              {selectedHistoryId === null && (
                <div className="ml-7 mt-4 grid gap-3">
                  <label className="flex flex-col text-sm text-body">
                    Form 5 opens
                    <input type="datetime-local" value={cycleWindows.settingsOpensAt} onChange={(e) => setCycleWindows((w) => ({ ...w, settingsOpensAt: e.target.value }))} className="mt-1 px-2 py-1.5 border border-line rounded" />
                  </label>
                  <label className="flex flex-col text-sm text-body">
                    Form 5 closes
                    <input type="datetime-local" value={cycleWindows.settingsClosesAt} onChange={(e) => setCycleWindows((w) => ({ ...w, settingsClosesAt: e.target.value }))} className="mt-1 px-2 py-1.5 border border-line rounded" />
                  </label>
                  <button onClick={() => handleStartCycle(true)} disabled={startingCycle || !cycleWindows.settingsOpensAt || !cycleWindows.settingsClosesAt} className="mt-2 py-2 bg-pes text-white rounded font-medium disabled:opacity-50">
                    {startingCycle ? "Starting..." : "Start full cycle"}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-canvas border border-line rounded-xl p-5 hover:border-pes hover:shadow-sm transition-all cursor-pointer" onClick={() => setSelectedHistoryId(historyCycles[0]?.id || null)}>
              <div className="flex items-center gap-3 mb-2">
                <input type="radio" checked={selectedHistoryId !== null} onChange={() => { if(historyCycles.length > 0) setSelectedHistoryId(historyCycles[0].id) }} disabled={historyCycles.length === 0} className="w-4 h-4 text-pes" />
                <h3 className="font-bold text-strong">Load from history</h3>
              </div>
              <p className="text-sm text-muted ml-7 mb-4">
                Reuse limits from a past cycle and jump straight to Form 6 (feeling).
              </p>
              {selectedHistoryId !== null && (
                <div className="ml-7 grid gap-3">
                  {historyLoading ? (
                    <p className="text-sm text-muted animate-pulse">Loading history...</p>
                  ) : historyCycles.length === 0 ? (
                    <p className="text-sm text-warning-700">No past cycles found.</p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto space-y-2 mb-2 pr-2">
                      {historyCycles.map(c => {
                        const limits = typeof c.limits === 'string' ? JSON.parse(c.limits) : c.limits;
                        const sessionLabel = c.sessionId ? String(c.sessionId) : 'Legacy';
                        const iterLabel = c.iteration ?? 1;
                        return (
                          <label key={c.id} className={`flex flex-col p-3 border rounded cursor-pointer transition-colors ${selectedHistoryId === c.id ? 'border-pes bg-pes-50' : 'border-line bg-white hover:bg-canvas'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <input type="radio" name="historyId" checked={selectedHistoryId === c.id} onChange={() => setSelectedHistoryId(c.id)} className="w-3 h-3 text-pes" />
                              <span className="text-xs font-semibold">Session {sessionLabel} (Iter {iterLabel})</span>
                              <span className="text-[10px] text-muted ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            {limits && typeof limits === 'object' && (
                              <div className={`ml-5 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 transition-opacity ${selectedHistoryId === c.id ? 'opacity-100' : 'opacity-60'}`}>
                                {Object.entries(limits).map(([k, v]) => (
                                  <div key={k} className="flex justify-between items-center text-[10px] border-b border-line/50 pb-0.5">
                                    <span className="text-muted capitalize truncate pr-2">{k.replace(/_/g, ' ')}</span>
                                    <span className="font-semibold text-strong">{Number(v).toFixed(1)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                  <label className="flex flex-col text-sm text-body">
                    Form 6/7 opens
                    <input type="datetime-local" value={cycleWindows.feelingOpensAt} onChange={(e) => setCycleWindows((w) => ({ ...w, feelingOpensAt: e.target.value }))} className="mt-1 px-2 py-1.5 border border-line rounded" />
                  </label>
                  <label className="flex flex-col text-sm text-body">
                    Form 6/7 closes
                    <input type="datetime-local" value={cycleWindows.feelingClosesAt} onChange={(e) => setCycleWindows((w) => ({ ...w, feelingClosesAt: e.target.value }))} className="mt-1 px-2 py-1.5 border border-line rounded" />
                  </label>
                  <button onClick={() => handleStartCycle(false)} disabled={startingCycle || !selectedHistoryId || !cycleWindows.feelingOpensAt || !cycleWindows.feelingClosesAt} className="mt-2 py-2 bg-pes text-white rounded font-medium disabled:opacity-50">
                    {startingCycle ? "Starting..." : "Start feeling-only cycle"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ESTAB / PERSONNEL: departmental & faculty submission/approval status */}
      {activeTab === "analysis" && isAdmin && inSession && approvalStatus?.active && (
        <div className="bg-white rounded-xl border border-line p-8 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-strong mb-1">Submission &amp; Approval Status</h2>
          <p className="text-sm text-muted mb-5">
            Which departments and {terms.unitPlural.toLowerCase()} have submitted and been approved by their heads for this cycle.
          </p>
          {(["departments", "faculties"] as const).map((group) => (
            <div key={group} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-body mb-2">{group === "departments" ? "Departments" : terms.unitPlural}</h3>
              <div className="overflow-x-auto border border-line rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-canvas text-body">
                    <tr>
                      <th className="px-4 py-2 font-semibold">{group === "departments" ? "Department" : terms.unit}</th>
                      <th className="px-4 py-2 font-semibold text-right">Staff</th>
                      <th className="px-4 py-2 font-semibold text-right">Submitted</th>
                      <th className="px-4 py-2 font-semibold text-right">Approved</th>
                      <th className="px-4 py-2 font-semibold text-right">Status</th>
                      <th className="px-4 py-2 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {(approvalStatus[group] as any[]).map((d) => {
                      // The faculty/head tier only matters for academic orgs.
                      const headRelevant = group === "departments" || approvalStatus.academic;
                      const noHead = headRelevant && d.hasHead === false && d.staff > 0;
                      const headLabel = group === "departments" ? "HOD" : terms.head;
                      return (
                      <tr key={d.name}>
                        <td className="px-4 py-2 font-medium text-strong">
                          {d.name}
                          {noHead && (
                            <span className="ml-2 text-danger-600 bg-danger-50 border border-danger-100 px-2 py-0.5 rounded-full text-[11px] font-medium">No {headLabel} assigned</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right text-body">{d.staff}</td>
                        <td className="px-4 py-2 text-right text-body">{d.submitted}</td>
                        <td className="px-4 py-2 text-right text-body">{d.approved}</td>
                        <td className="px-4 py-2 text-right">
                          {d.cleared ? (
                            <span className="text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-medium">Cleared</span>
                          ) : (
                            <span className="text-warning-700 bg-warning-50 px-2.5 py-1 rounded-full text-xs font-medium">
                              Pending{d.pendingApproval > 0 ? ` (${d.pendingApproval} to approve)` : ""}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {d.pendingApproval > 0 && (
                            <button
                              onClick={() => handleAdminApprove(group, d.name)}
                              disabled={approvingUnit === `${group}:${d.name}`}
                              title={noHead ? `No ${headLabel} is assigned — approve on their behalf so evaluation isn't blocked` : "Approve on behalf (admin override)"}
                              className="text-pes text-xs font-medium border border-pes/30 rounded-md px-3 py-1.5 hover:bg-pes/5 disabled:opacity-50"
                            >
                              {approvingUnit === `${group}:${d.name}` ? "Approving…" : "Approve"}
                            </button>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* THEME & FEELING REPORT (aggregated Form 6/7) */}
      {activeTab === "analysis" && isAdmin && inSession && themeReport?.active && themeReport.staffCount > 0 && (
        <div className="bg-white rounded-xl border border-line p-8 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-strong mb-1">Theme &amp; Feeling Report</h2>
          <p className="text-sm text-muted mb-5">
            Aggregated from {themeReport.staffCount} theme &amp; feeling (Form 6/7) submission(s).
          </p>

          <h3 className="text-sm font-semibold text-body mb-2">Most frequent stress themes</h3>
          <div className="overflow-x-auto border border-line rounded-lg mb-6">
            <table className="w-full text-sm text-left">
              <thead className="bg-canvas text-body">
                <tr>
                  <th className="px-4 py-2 font-semibold">Theme</th>
                  <th className="px-4 py-2 font-semibold text-right">Total frequency</th>
                  <th className="px-4 py-2 font-semibold text-right">% of all themes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(themeReport.themes as any[]).map((t) => (
                  <tr key={t.theme}>
                    <td className="px-4 py-2 font-medium text-strong">{t.theme}</td>
                    <td className="px-4 py-2 text-right text-body">{t.total}</td>
                    <td className="px-4 py-2 text-right font-semibold text-strong">{t.percent.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-sm font-semibold text-body mb-2">Dominant feeling per stress category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {(themeReport.categories as any[]).map((c) => (
              <div key={c.key} className="bg-canvas rounded-md p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted truncate">{c.label}</p>
                <p className="text-sm font-bold text-strong">{c.dominant || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RUN SETTING (intermediate step) */}
      {activeTab === "analysis" && isAdmin && inSession && (
        <div className="bg-white rounded-xl border border-line p-8 shadow-sm mb-6">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-strong">Step 1 — Run Setting</h2>
              <p className="text-sm text-muted max-w-xl">
                <strong>View Form 5 results</strong> at any time to see the per-category means so far. When Form 5 closes, <strong>Run Setting</strong> locks those means in as the maximums Form 6 (themes &amp; feeling) maps against and opens Form 6.
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <label className="flex flex-col text-xs font-medium text-muted">
                Form 6/7 closes on (optional)
                <input
                  type="datetime-local"
                  value={feelingClosesAt}
                  onChange={(e) => setFeelingClosesAt(e.target.value)}
                  disabled={cycleStatus?.phase !== "settings_closed"}
                  className="mt-1 px-3 py-2 border border-line rounded-lg font-normal disabled:opacity-50"
                />
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviewSetting}
                  disabled={previewing || !cycleStatus?.active}
                  className="px-5 py-3 border border-pes-200 text-pes-700 rounded-lg hover:bg-pes-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {previewing ? "Loading…" : "View Form 5 results"}
                </button>
                <button
                  onClick={handleRunSetting}
                  disabled={runningSetting || cycleStatus?.phase !== "settings_closed"}
                  title={cycleStatus?.phase !== "settings_closed" ? "Close Form 5 first to lock in the setting" : undefined}
                  className="px-6 py-3 bg-pes text-white rounded-lg hover:bg-pes-800 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {runningSetting ? "Computing…" : "Run / Evaluate Setting"}
                </button>
              </div>
              {cycleStatus?.active && cycleStatus.phase !== "settings_closed" && (
                <span className="text-xs text-muted">
                  “Run Setting” locks in the limits &amp; opens Form 6 — available once Form 5 is closed. You can view results any time.
                </span>
              )}
            </div>
          </div>
          {settingMsg && <p className="text-sm text-body mb-3">{settingMsg}</p>}
          {settingLimits && (
            <>
            {!previewLocked && (
              <p className="text-xs font-medium text-warning-600 mb-2">
                Live preview — these limits are not locked in until you Run Setting.
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-2">
              {Object.entries(settingLimits).map(([k, v]) => (
                <div key={k} className="bg-canvas rounded-md p-3 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-muted truncate">{k.replace(/_/g, " ")}</p>
                  <p className="text-lg font-bold text-strong">{Number(v).toFixed(1)}</p>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      )}

      {/* ANALYSIS TAB (Run ANOVA) — only while a cycle is in session */}
      {activeTab === "analysis" && inSession && (
        <div className="bg-white rounded-xl border border-line p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-line">
            <div className="w-12 h-12 rounded-full bg-pes-50 flex items-center justify-center text-pes-600">
              <Calculator size="24" variant="Bold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-strong">Step 2 — Run Statistical Analysis</h2>
              <p className="text-sm text-muted">Perform ANOVA to detect significant differences between departments.</p>
            </div>
          </div>
          
          <div className="max-w-2xl">
            <p className="text-body mb-6 leading-relaxed text-sm">
              This tool automatically aggregates {enrichedData.length} individual stress reports collected from your organization. 
              By running the ANOVA (Analysis of Variance) test, it determines whether stress levels vary significantly across different departments.
            </p>
            
            {isAdmin ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={runANOVA}
                  disabled={!canRunAnova}
                  title={anovaBlockedReason ?? undefined}
                  className="w-full sm:w-auto px-8 py-3 bg-pes text-white rounded-lg hover:bg-pes-800 transition-colors font-medium shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Chart2 size="18" />
                  Run ANOVA & Generate Report
                </button>
                {anovaBlockedReason && (
                  <div className="flex items-start gap-2 rounded-lg border border-warning-100 bg-warning-50 px-4 py-3 text-sm text-warning-700 max-w-xl">
                    <Warning2 size="18" className="text-warning-600 mt-0.5 shrink-0" variant="Bold" />
                    <span>{anovaBlockedReason}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-danger-50 border border-danger-100 rounded-lg p-4 flex gap-3">
                <Warning2 className="text-danger-600 mt-0.5" size="20" />
                <div>
                  <h4 className="text-sm font-bold text-danger-700 mb-1">Access Denied</h4>
                  <p className="text-xs text-danger-700">Only administrators can run the ANOVA analysis and generate organizational reports.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESULTS TAB */}
      {activeTab === "results" && summary && (
        <div className="space-y-6">
          {summary.generatedAt && (
            <p className="text-sm text-muted">
              Generated on {new Date(summary.generatedAt).toLocaleString()}
            </p>
          )}
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-line p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Overall Stress</span>
              <span className="text-4xl font-bold text-danger-600">{(summary.stress).toFixed(1)}%</span>
            </div>
            <div className="bg-white rounded-xl border border-line p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Overall Pressure</span>
              <span className="text-4xl font-bold text-orange-500">{(summary.pressure).toFixed(1)}%</span>
            </div>
            <div className="bg-white rounded-xl border border-line p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Overall Conflict</span>
              <span className="text-4xl font-bold text-yellow-500">{(summary.conflict).toFixed(1)}%</span>
            </div>
          </div>

          {/* Form 6/7 outputs: overall theme frequency + the major feeling. */}
          {(() => {
            const themes = (themeReport?.themes ?? []) as { theme: string; total: number; percent: number }[];
            const feelingTotals: Record<string, number> = {};
            (themeReport?.categories ?? []).forEach((c: any) => {
              Object.entries(c?.feelings ?? {}).forEach(([f, n]) => {
                feelingTotals[f] = (feelingTotals[f] ?? 0) + Number(n || 0);
              });
            });
            const majorFeeling = Object.entries(feelingTotals).sort((a, b) => b[1] - a[1])[0];
            if (themes.length === 0 && !majorFeeling) return null;
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-strong mb-3">Theme frequency (Form 6)</h3>
                  <div className="space-y-2">
                    {[...themes].sort((a, b) => b.total - a.total).slice(0, 5).map((t) => (
                      <div key={t.theme} className="flex justify-between text-sm">
                        <span className="text-body">{t.theme}</span>
                        <span className="font-semibold">{t.total} ({Number(t.percent).toFixed(1)}%)</span>
                      </div>
                    ))}
                    {themes.length === 0 && <p className="text-sm text-muted">No theme data.</p>}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-line p-6 shadow-sm flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-strong mb-2">Major feeling (Form 7)</h3>
                  {majorFeeling ? (
                    <>
                      <span className="text-3xl font-bold text-pes-700">{majorFeeling[0]}</span>
                      <span className="text-sm text-muted mt-1">Most reported feeling across all stress categories ({majorFeeling[1]}).</span>
                    </>
                  ) : (
                    <p className="text-sm text-muted">No feeling data.</p>
                  )}
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Data */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
                <h3 className="text-lg font-bold text-strong mb-4 border-b border-line pb-2">ANOVA Results</h3>
                {anovaResult && anovaResult.applicable === false && (
                  <div className="p-4 rounded-md border border-warning-100 bg-warning-50">
                    <p className="text-sm font-bold text-warning-700 mb-1">ANOVA not applicable</p>
                    <p className="text-sm text-warning-700">
                      An ANOVA needs at least two departments with at least two staff between them to measure variance.
                      {typeof anovaResult.groups === "number" && typeof anovaResult.staff === "number"
                        ? ` This analysis has ${anovaResult.staff} staff across ${anovaResult.groups} department${anovaResult.groups === 1 ? "" : "s"}.`
                        : ""}{" "}
                      The stress values are still reported below and by department — only the significance test is skipped.
                    </p>
                  </div>
                )}
                {anovaResult && anovaResult.applicable !== false && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-body">F-Statistic:</span>
                      <span className="font-semibold">{anovaResult.fStatistic?.toFixed(3) || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-body">Critical Value:</span>
                      <span className="font-semibold">{anovaResult.criticalValue || "2.89"}</span>
                    </div>
                    <div className={`mt-4 p-3 rounded-md text-sm font-semibold border ${
                      (anovaResult.conclusion || "").includes("Reject")
                        ? "bg-danger-50 text-danger-700 border-danger-100"
                        : "bg-green-50 text-green-800 border-green-200"
                    }`}>
                      {anovaResult.conclusion}
                    </div>
                    {/* Reset rule callout based on the 5% threshold */}
                    <div className={`mt-2 p-3 rounded-md text-sm border ${
                      summary.needsReset === true
                        ? "bg-warning-50 text-warning-700 border-warning-100"
                        : summary.needsReset === false
                          ? "bg-canvas text-body border-line"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}>
                      {summary.needsReset === true
                        ? RESET_MESSAGE
                        : summary.needsReset === false
                          ? "Within range — no reset needed."
                          : "Save results to see F1 ± 5% boundary check."}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
                <h3 className="text-lg font-bold text-strong mb-4 border-b border-line pb-2">Save Evaluation</h3>
                {msg && (
                  <div className={`mb-4 p-3 rounded-md text-sm font-medium border ${
                    msg.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-danger-50 text-danger-700 border-danger-100"
                  }`}>
                    {msg.text}
                  </div>
                )}
                {isAdmin && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm flex justify-center items-center gap-2 mb-3"
                  >
                    {saving ? "Saving..." : (
                      <>
                        <Save2 size="18" />
                        Save Results to Database
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 bg-white border border-line text-body rounded-lg hover:bg-canvas transition-colors font-medium shadow-sm flex justify-center items-center gap-2"
                >
                  <DocumentText size="18" />
                  Print Report
                </button>
              </div>
            </div>

            {/* Right Column - Chart */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-line p-6 shadow-sm h-full">
                <h3 className="text-lg font-bold text-strong mb-1">Stress Distribution (Normal Curve)</h3>
                <p className="text-xs text-muted mb-6">
                  Y-axis: stress score (0–100) · Bell curve centred at mean 50 · Reference lines show normal range (32–68)
                </p>
                <div className="w-full -ml-16">
                  <ResponsiveContainer width="100%" height={450}>
                    <ComposedChart
                      data={generateNormalCurve(50, 15)}
                      layout="vertical"
                      margin={{ right: 200, left: 20, bottom: 20, top: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} />
                      <XAxis type="number" dataKey="density" domain={[0, 110]} hide />
                      <YAxis
                        type="number"
                        dataKey="y"
                        domain={[0, 100]}
                        ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                        reversed
                      />
                      <Tooltip
                        formatter={(val: any) => [`${Number(val).toFixed(1)}`, "Density"]}
                        labelFormatter={(label) => `Stress score: ${label}`}
                      />
                      <Line type="monotone" dataKey="density" stroke="#4f46e5" strokeWidth={2} dot={false} name="Normal curve" />
                      <ReferenceLine y={32} stroke="blue" label={{ value: "Minimum stress 32%", position: "insideLeft", fill: "blue", fontSize: 12 }} />
                      <ReferenceLine y={68} stroke="red" label={{ value: "Maximum stress limit 68%", position: "insideLeft", fill: "red", fontSize: 12 }} />
                      {/* Warning line 5% below the max limit (68% − 5% = 63%). */}
                      <ReferenceLine y={63} stroke="#eab308" strokeDasharray="6 4" strokeWidth={2} label={{ value: "Warning 63%", position: "right", fill: "#a16207", fontSize: 12, fontWeight: 600 }} />
                      <ReferenceLine y={50} stroke="black" strokeDasharray="5 5" label={{ value: "Average", position: "insideTopLeft", fontSize: 12 }} />
                      <ReferenceLine
                        y={Math.min(100, summary.stress)}
                        stroke="#16a34a"
                        strokeWidth={2}
                        label={{
                          value: `Acquired stress ${(summary.stress).toFixed(1)}%`,
                          position: "right",
                          fill: "#16a34a",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>

          {/* Grouped results — departmental, faculty, institutional ONLY.
              No individual staff results are shown (per requirement). */}
          {([
            { title: "Departmental Results", subject: "Department", rows: departmentResults },
            { title: "Faculty Results", subject: "Faculty", rows: facultyResults },
            { title: "Institutional Result", subject: "Level", rows: institutionResults },
          ] as const).map((section) => (
            <div key={section.title} className="bg-white rounded-xl border border-line overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-line bg-canvas">
                <h3 className="text-lg font-bold text-strong">{section.title}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-canvas border-b border-line text-body">
                    <tr>
                      <th className="px-6 py-3 font-semibold">{section.subject}</th>
                      <th className="px-6 py-3 font-semibold text-right">Staff</th>
                      <th className="px-6 py-3 font-semibold text-right">Stress</th>
                      <th className="px-6 py-3 font-semibold text-right">Pressure</th>
                      <th className="px-6 py-3 font-semibold text-right">Conflict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {section.rows.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-4 text-muted text-center">No data</td></tr>
                    ) : (
                      section.rows.map((r) => (
                        <tr key={r.name} className="hover:bg-canvas/50 transition-colors">
                          <td className="px-6 py-3 font-medium text-strong">{r.name}</td>
                          <td className="px-6 py-3 text-right text-body">{r.count}</td>
                          <td className="px-6 py-3 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-danger-100 text-danger-700">
                              {(r.stress).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              {(r.pressure).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              {(r.conflict).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
