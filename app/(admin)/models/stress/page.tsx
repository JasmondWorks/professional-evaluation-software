"use client";

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";import { getAccessToken } from '@/app/utils/auth';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
} from "recharts";

const generateNormalCurve = (mean = 50, stdDev = 15) => {
  const data = [];

  for (let y = 0; y <= 100; y += 1) {
    const x =
      (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * ((y - mean) / stdDev) ** 2);

    data.push({ x, y });
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

  useEffect(() => {
    async function fetchData() {
      const token = getAccessToken();

      if (!token) return;

      const decoded: any = jwt.decode(token);

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

  const normalize = (val: number) => Math.min(100, (val / 5) * 100);

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

  const stressValues = enrichedData.map((d) => d.stressFactor * 100);

  const avgStress =
    stressValues.reduce((a, b) => a + b, 0) / stressValues.length;

  const normalX = (y: number, mean = 50, stdDev = 15) =>
    (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
    Math.exp(-0.5 * ((y - mean) ** 2) / stdDev ** 2);

  const scatterData = enrichedData.map((d) => {
    const stress = d.stressFactor * 100;

    return {
      y: stress,
      x: normalX(stress),
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
        <div className="flex gap-2 mb-4">
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
          <div className="bg-white p-6 rounded shadow">
            <button
              onClick={runANOVA}
              className="bg-green-600 text-white px-5 py-2 rounded"
            >
              Run ANOVA
            </button>
          </div>
        )}

        {/* RESULTS */}
        {activeTab === "results" && (
          <div className="bg-white p-6 rounded shadow">
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
                      {summary.stress.toFixed(2)}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {summary.pressure.toFixed(2)}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {summary.conflict.toFixed(2)}
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
                      {s.stressFactor.toFixed(1)}
                    </td>
                    <td className="border px-4 py-2">
                      {s.pressureFactor.toFixed(1)}
                    </td>
                    <td className="border px-4 py-2">
                      {s.conflictFactor.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* GRAPH */}
            <div className="mt-10 w-[45rem] overflow-visible">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={generateNormalCurve()}
                  margin={{ right: 300, left: 100, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis type="number" dataKey="x" hide />

                  <YAxis
                    type="number"
                    dataKey="y"
                    domain={[0, 100]}
                    ticks={[0, 50, 100]}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="x"
                    stroke="#4f46e5"
                    dot={false}
                  />

                  <ReferenceLine
                    y={32}
                    x={100}
                    stroke="blue"
                    label={{ value: "Min 32%", position: "left" }}
                  />

                  <ReferenceLine
                    y={68}
                    x={100}
                    stroke="red"
                    label={{ value: "Max 68%", position: "left" }}
                  />

                  <ReferenceLine
                    y={60}
                    x={100}
                    stroke="#46e57b"
                    label={{
                      value: `Acquired stress 
                      ${summary?.stress}`,
                      position: "right",
                    }}
                    className="z-200"
                  />

                  <ReferenceLine
                    y={50}
                    stroke="black"
                    strokeDasharray="5 5"
                    label="Average"
                  />

                  <Scatter data={scatterData} fill="black" />
                </LineChart>
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