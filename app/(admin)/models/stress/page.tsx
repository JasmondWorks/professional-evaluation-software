"use client";

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
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

const generateNormalCurve = (mean = 50, stdDev = 15) => {
  const data = [];
  // peak of the PDF at the mean
  const peak = 1 / (stdDev * Math.sqrt(2 * Math.PI));

  for (let y = 0; y <= 100; y += 0.5) {
    const pdf =
      (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * ((y - mean) / stdDev) ** 2);

    // scale so the peak reaches 100 on the x-axis — makes the bell fully visible
    data.push({ y, density: (pdf / peak) * 100 });
  }

  return data;
};

const mean = (arrayData: number[]) => {
  if (arrayData.length === 0) return 0;

  const sum = arrayData.reduce((acc, current) => acc + current, 0);

  return sum / arrayData.length;
};

// ===== Types =====
interface StressEntry {
  id: number;
  user_name: string;
  org: string;
  dept: string;

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

// ===== ANOVA =====
const computeANOVA = (groups: GroupedData) => {
  const allValues = Object.values(groups).flat();
  const overallMean = mean(allValues);

  const n = allValues.length;
  const k = Object.keys(groups).length;

  const ssto = allValues.reduce(
    (sum, v) => sum + Math.pow(v - overallMean, 2),
    0
  );

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

  return { conclusion };
};

export default function StressAnalysisTool() {
  const [activeTab, setActiveTab] = useState<"analysis" | "results">(
    "analysis"
  );
  const [stressData, setStressData] = useState<StressEntry[]>([]);
  const [anovaResult, setAnovaResult] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("access_token");

      if (!token) return;

      const decoded: any = jwt.decode(token);
      setRole(decoded?.role || null);

      const res = await fetch("/api/getStressDataScores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org: decoded?.org }),
      });

      const data = await res.json();
      setStressData(data);
    }

    fetchData();
  }, []);

  const isAdmin = role === "super-admin" || role === "admin";

  const enrichedData = stressData.map((s) => {
    const rawStress =
      Number(s.organizational) / 383 +
      Number(s.student) / 175 +
      Number(s.administrative) / 166 +
      Number(s.negative_public_attitude) / 9 +
      Number(s.teacher) / 92 +
      Number(s.parents) / 50 +
      Number(s.occupational) / 30 +
      Number(s.academic_program) / 23 +
      Number(s.personal) / 26 +
      Number(s.misc) / 27;

    const rawPressure =
      Number(s.organizational) / 383 +
      Number(s.student) / 175 +
      Number(s.administrative) / 166 +
      Number(s.academic_program) / 23 +
      Number(s.negative_public_attitude) / 9;

    const conflict =
      Number(s.organizational) / 383 +
      Number(s.student) / 175 +
      Number(s.administrative) / 166 +
      Number(s.teacher) / 92 +
      Number(s.parents) / 50 +
      Number(s.academic_program) / 23;

    return {
      ...s,
      stressFactor: rawStress,
      pressureFactor: rawPressure,
      conflictFactor: conflict,
    };
  });

  const runANOVA = () => {
    const grouped: GroupedData = {};

    const stressValues: number[] = [];
    const pressureValues: number[] = [];
    const conflictValues: number[] = [];

    console.log(enrichedData);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Stress Evaluation
          </h1>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-4 print:hidden">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-4 py-2 rounded ${
              activeTab === "analysis"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100"
            }`}
          >
            Analysis
          </button>

          <button
            onClick={() => setActiveTab("results")}
            className={`px-4 py-2 rounded ${
              activeTab === "results"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100"
            }`}
          >
            Results
          </button>
        </div>

        {/* ANALYSIS */}
        {activeTab === "analysis" && (
          <div className="bg-white p-6 rounded shadow print:hidden">
            {isAdmin ? (
              <button
                onClick={runANOVA}
                className="bg-green-600 text-white px-5 py-2 rounded"
              >
                Run ANOVA
              </button>
            ) : (
              <p className="text-red-600 font-semibold text-sm">Only admins can run ANOVA analysis.</p>
            )}
          </div>
        )}

        {/* RESULTS */}
        {activeTab === "results" && (
          <div className="bg-white p-6 rounded shadow">
            {isAdmin && (
              <div className="flex justify-end mb-4 print:hidden">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Print Results
                </button>
              </div>
            )}
            {/* SUMMARY TABLE */}
            {summary && (
              <table className="w-full border border-gray-300 mb-6">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2">Stress Factor</th>
                    <th className="border px-4 py-2">Pressure Factor</th>
                    <th className="border px-4 py-2">Conflict</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2 text-center">
                      {(summary.stress * 100).toFixed(2)}%
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {(summary.pressure * 100).toFixed(2)}%
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {(summary.conflict * 100).toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* PER USER TABLE */}
            <table className="w-full border border-gray-300 mt-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Dept</th>
                  <th className="border px-4 py-2">Stress</th>
                  <th className="border px-4 py-2">Pressure</th>
                  <th className="border px-4 py-2">Conflict</th>
                </tr>
              </thead>
              <tbody>
                {enrichedData.map((s) => (
                  <tr key={s.id}>
                    <td className="border px-4 py-2">{s.user_name}</td>
                    <td className="border px-4 py-2">{s.dept}</td>
                    <td className="border px-4 py-2">
                      {(s.stressFactor * 100).toFixed(1)}%
                    </td>
                    <td className="border px-4 py-2">
                      {(s.pressureFactor * 100).toFixed(1)}%
                    </td>
                    <td className="border px-4 py-2">
                      {(s.conflictFactor * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* GRAPH */}
            <div className="mt-10 w-[45rem] overflow-visible">
              <h3 className="text-base font-semibold text-gray-700 mb-1">Stress Distribution (Normal Curve)</h3>
              <p className="text-xs text-gray-400 mb-4">
                Y-axis: stress score (0–100) · Bell curve centred at mean 50 · Reference lines show normal range (32–68)
              </p>
              <ResponsiveContainer width="100%" height={450}>
                <ComposedChart
                  data={generateNormalCurve(50, 15)}
                  layout="vertical"
                  margin={{ right: 220, left: 80, bottom: 20, top: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} />

                  {/* X axis = density (0–100 scaled) */}
                  <XAxis
                    type="number"
                    dataKey="density"
                    domain={[0, 110]}
                    hide
                  />

                  {/* Y axis = stress score 0–100, 0 at bottom */}
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

                  {/* The bell curve */}
                  <Line
                    type="monotone"
                    dataKey="density"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={false}
                    name="Normal curve"
                  />

                  {/* Min −1σ ≈ 32 */}
                  <ReferenceLine
                    y={32}
                    stroke="blue"
                    label={{ value: "Min 32%", position: "left", fill: "blue", fontSize: 12 }}
                  />

                  {/* Max +1σ ≈ 68 */}
                  <ReferenceLine
                    y={68}
                    stroke="red"
                    label={{ value: "Max 68%", position: "left", fill: "red", fontSize: 12 }}
                  />

                  {/* Average / mean */}
                  <ReferenceLine
                    y={50}
                    stroke="black"
                    strokeDasharray="5 5"
                    label={{ value: "Average", position: "insideTopLeft", fontSize: 12 }}
                  />

                  {/* Acquired stress — stressFactor sums to ~0–1 range, so * 100 gives 0–100 */}
                  {summary && (
                    <ReferenceLine
                      y={Math.min(100, summary.stress * 100)}
                      stroke="#16a34a"
                      strokeWidth={2}
                      label={{
                        value: `Acquired stress  ${(summary.stress * 100).toFixed(1)}%`,
                        position: "right",
                        fill: "#16a34a",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* ANOVA */}
            {anovaResult && (
              <div className="mt-6">
                <p>{anovaResult.conclusion}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
