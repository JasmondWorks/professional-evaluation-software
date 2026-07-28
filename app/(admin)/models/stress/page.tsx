"use client";

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { factors } from "@/app/lib/stress/scoring";
import { CategoryValues } from "@/app/lib/stress/scoring";
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
  const [anovaResult, setAnovaResult] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{type: "success" | "error", text: string} | null>(null);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const decoded: any = jwt.decode(token);
        setRole(decoded?.role || null);

        const res = await fetch("/api/getStressDataScores", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        setStressData(data);
      } catch (e) {
        console.error("Failed to load stress data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const isAdmin = role === "super-admin" || role === "admin";

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
  const departmentResults = aggregateBy((e) => e.dept);
  const facultyResults = aggregateBy((e) => e.faculty || "Unknown Faculty");
  const institutionResults: LevelRow[] = enrichedData.length
    ? [
        {
          name: "Whole Institution",
          count: enrichedData.length,
          stress: mean(enrichedData.map((r) => r.stressFactor)),
          pressure: mean(enrichedData.map((r) => r.pressureFactor)),
          conflict: mean(enrichedData.map((r) => r.conflictFactor)),
        },
      ]
    : [];

  const runANOVA = () => {
    const grouped: GroupedData = {};
    const stressValues: number[] = [];
    const pressureValues: number[] = [];
    const conflictValues: number[] = [];

    enrichedData.forEach((e) => {
      if (!grouped[e.dept]) grouped[e.dept] = [];
      grouped[e.dept].push(e.stressFactor);
      stressValues.push(e.stressFactor);
      pressureValues.push(e.pressureFactor);
      conflictValues.push(e.conflictFactor);
    });

    setAnovaResult(computeANOVA(grouped));
    setSummary({
      stress: mean(stressValues),
      pressure: mean(pressureValues),
      conflict: mean(conflictValues),
    });
    setActiveTab("results");
  };

  const handleSave = async () => {
    if (!summary) return;
    setSaving(true);
    setMsg(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/saveStressEvaluation", {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pes mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full mx-auto max-w-7xl">
      <div className="mb-4">
        <Link
          href="/models"
          className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Models
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Stress Evaluation Tool</h1>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Analyze self-reported stress, pressure, and conflict factors across departments using ANOVA.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/stress/history"
            className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <DocumentText size="16" />
            View History
          </Link>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 print:hidden">
        <button
          onClick={() => setActiveTab("analysis")}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "analysis"
              ? "border-pes text-pes"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          Evaluation Results
        </button>
      </div>

      {/* ANALYSIS TAB */}
      {activeTab === "analysis" && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Calculator size="24" variant="Bold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Run Statistical Analysis</h2>
              <p className="text-sm text-gray-500">Perform ANOVA to detect significant differences between departments.</p>
            </div>
          </div>
          
          <div className="max-w-2xl">
            <p className="text-gray-700 mb-6 leading-relaxed text-sm">
              This tool automatically aggregates {enrichedData.length} individual stress reports collected from your organization. 
              By running the ANOVA (Analysis of Variance) test, it determines whether stress levels vary significantly across different departments.
            </p>
            
            {isAdmin ? (
              <button
                onClick={runANOVA}
                className="w-full sm:w-auto px-8 py-3 bg-pes text-white rounded-lg hover:bg-blue-900 transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
              >
                <Chart2 size="18" />
                Run ANOVA & Generate Report
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <Warning2 className="text-red-600 mt-0.5" size="20" />
                <div>
                  <h4 className="text-sm font-bold text-red-900 mb-1">Access Denied</h4>
                  <p className="text-xs text-red-700">Only administrators can run the ANOVA analysis and generate organizational reports.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESULTS TAB */}
      {activeTab === "results" && summary && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Overall Stress</span>
              <span className="text-4xl font-bold text-red-600">{(summary.stress).toFixed(1)}%</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Overall Pressure</span>
              <span className="text-4xl font-bold text-orange-500">{(summary.pressure).toFixed(1)}%</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Overall Conflict</span>
              <span className="text-4xl font-bold text-yellow-500">{(summary.conflict).toFixed(1)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Data */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">ANOVA Results</h3>
                {anovaResult && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">F-Statistic:</span>
                      <span className="font-semibold">{anovaResult.fStatistic?.toFixed(3) || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Critical Value:</span>
                      <span className="font-semibold">{anovaResult.criticalValue || "2.89"}</span>
                    </div>
                    <div className={`mt-4 p-3 rounded-md text-sm font-semibold border ${
                      anovaResult.conclusion.includes("Reject")
                        ? "bg-red-50 text-red-800 border-red-200"
                        : "bg-green-50 text-green-800 border-green-200"
                    }`}>
                      {anovaResult.conclusion}
                    </div>
                    {/* Reset rule: a rejected H₀ means the stress feeling shifted
                        significantly, so the setting (Form 5) must be re-run. */}
                    <div className={`mt-2 p-3 rounded-md text-sm border ${
                      anovaResult.conclusion.includes("Reject")
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>
                      {anovaResult.conclusion.includes("Reject")
                        ? "The feeling is changed and there is need for reset of the setting."
                        : "Not violated, still within range."}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Save Evaluation</h3>
                {msg && (
                  <div className={`mb-4 p-3 rounded-md text-sm font-medium border ${
                    msg.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
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
                  className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm flex justify-center items-center gap-2"
                >
                  <DocumentText size="18" />
                  Print Report
                </button>
              </div>
            </div>

            {/* Right Column - Chart */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-hidden h-full">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Stress Distribution (Normal Curve)</h3>
                <p className="text-xs text-gray-500 mb-6">
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
                      <ReferenceLine y={32} stroke="blue" label={{ value: "Minimum stress 32%", position: "left", fill: "blue", fontSize: 12 }} />
                      <ReferenceLine y={68} stroke="red" label={{ value: "Maximum stress limit 68%", position: "left", fill: "red", fontSize: 12 }} />
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
            <div key={section.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                    <tr>
                      <th className="px-6 py-3 font-semibold">{section.subject}</th>
                      <th className="px-6 py-3 font-semibold text-right">Staff</th>
                      <th className="px-6 py-3 font-semibold text-right">Stress</th>
                      <th className="px-6 py-3 font-semibold text-right">Pressure</th>
                      <th className="px-6 py-3 font-semibold text-right">Conflict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {section.rows.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-4 text-gray-400 text-center">No data</td></tr>
                    ) : (
                      section.rows.map((r) => (
                        <tr key={r.name} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3 font-medium text-gray-900">{r.name}</td>
                          <td className="px-6 py-3 text-right text-gray-600">{r.count}</td>
                          <td className="px-6 py-3 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
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
