"use client";

import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from "@/app/utils/auth";

import {
  findOptimalKCost,
  DParams,
  OptimalKCostResult,
} from "../personnel-utilization/lib/util-models11-16";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function RedundancyIndexPage() {
  const [activeTab, setActiveTab] = useState<"redundancy" | "cost">("redundancy");

  return (
    <div className="p-8 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">Redundancy Index</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("redundancy")}
          className={`px-4 py-2 rounded font-medium ${
            activeTab === "redundancy"
              ? "bg-pes text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Redundancy Index
        </button>
        <button
          onClick={() => setActiveTab("cost")}
          className={`px-4 py-2 rounded font-medium ${
            activeTab === "cost"
              ? "bg-pes text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Supervision Cost
        </button>
      </div>

      {activeTab === "redundancy" && <RedundancyTab />}
      {activeTab === "cost" && <SupervisionCostTab />}
    </div>
  );
}

// =====================================================================
// TAB 1: Redundancy Index (existing functionality, preserved)
// =====================================================================
function RedundancyTab() {
  const [data, setData] = useState({ wasted: "", total: "" });
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  function evaluateIndex() {
    const wasted = parseFloat(data.wasted);
    const total = parseFloat(data.total);

    if (isNaN(wasted) || isNaN(total)) return alert("Please enter valid numbers");
    if (total === 0) return alert("Total man-hours cannot be zero");

    const index = wasted / total;
    setResult(Number(index.toFixed(4)));
    setSuccessMsg("");
  }

  async function handleSubmit() {
    if (result === null) return alert("Please evaluate the index first");

    setLoading(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/addPersonnelIndex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({
          payload: "redundancy",
          redundancy: Number(result),
        }),
      });

      if (!res.ok) throw new Error("Failed to save data");

      setSuccessMsg("Successfully saved to database");
      setData({ wasted: "", total: "" });
      setResult(null);
    } catch (err) {
      console.error("Error saving data:", err);
      alert("Error saving redundancy index");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-gray-600 mb-6">
        Computes the redundancy index as the ratio of wasted man-hours to total establishment man-hours.
      </p>

      <div className="flex gap-8 mb-6 flex-wrap">
        <label className="flex flex-col w-72">
          <span className="text-sm font-medium">Wasted Man-hours</span>
          <input
            type="number"
            value={data.wasted}
            onChange={(e) => setData((d) => ({ ...d, wasted: e.target.value }))}
            className="border border-gray-300 px-4 py-2 rounded mt-1 outline-pes"
            placeholder="Enter wasted hours"
          />
        </label>

        <label className="flex flex-col w-72">
          <span className="text-sm font-medium">Total Establishment Man-hours</span>
          <input
            type="number"
            value={data.total}
            onChange={(e) => setData((d) => ({ ...d, total: e.target.value }))}
            className="border border-gray-300 px-4 py-2 rounded mt-1 outline-pes"
            placeholder="Enter total hours"
          />
        </label>
      </div>

      {result !== null && (
        <p className="text-green-700 font-semibold mb-3">
          Redundancy Index: {result}
        </p>
      )}

      {successMsg && (
        <p className="text-green-600 font-semibold mb-3">{successMsg}</p>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          className="bg-pes hover:opacity-90 text-white font-semibold px-12 py-3 rounded"
          onClick={evaluateIndex}
        >
          Evaluate
        </button>

        <button
          type="button"
          className={`${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-pes hover:opacity-90"
          } text-white font-semibold px-12 py-3 rounded`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// TAB 2: Supervision Cost — Wasted Man-Hours Cost Function (Eq. 8.35)
// =====================================================================
function SupervisionCostTab() {
  const [params, setParams] = useState<DParams>({
    A: 8,
    a: 50,
    b: 50,
    lambda: 1.847,
    mu: 6.5834,
  });
  const [result, setResult] = useState<OptimalKCostResult | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const getOrgFromToken = () => {
    try {
      const token = getAccessToken();
      if (!token) return null;
      const decoded: any = jwtDecode(token);
      return decoded?.org || null;
    } catch {
      return null;
    }
  };

  const handleChange = (key: keyof DParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    setResult(null);
  };

  const isFormValid = () => {
    if (!Number.isFinite(params.A) || params.A <= 0) return false;
    if (!Number.isFinite(params.a) || params.a <= 0) return false;
    if (!Number.isFinite(params.b) || params.b <= 0) return false;
    if (!Number.isFinite(params.lambda) || params.lambda <= 0) return false;
    if (!Number.isFinite(params.mu) || params.mu <= 0) return false;
    if (params.lambda >= params.mu) return false; // Eq. 8.9
    return true;
  };

  const calculate = () => {
    const r = findOptimalKCost(params);
    setResult(r);
  };

  const handleSave = async () => {
    if (!result) return;
    const org = getOrgFromToken();
    if (!org) {
      setSaveMsg("Missing org in token — please log in again.");
      return;
    }

    setSaving(true);
    setSaveMsg(null);

    try {
      const token = getAccessToken();
      if (!token) {
        setSaveMsg("Missing token — please log in again.");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/supervisionCost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          org,
          a_ij: params.A,
          a_cost: params.a,
          b_cost: params.b,
          lambda: params.lambda,
          mu: params.mu,
          rho: result.rho,
          p0: result.P0,
          lbar: result.Lbar,
          kmin: 1,
          kmax: result.table.length,
          kstar: result.Kstar,
          dstar: result.Dstar,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      setSaveMsg("Saved successfully!");
    } catch (err) {
      console.error(err);
      setSaveMsg("Error saving result.");
    } finally {
      setSaving(false);
    }
  };

  // Input helper
  const numberInput = (
    key: keyof DParams,
    label: string,
    hint: string,
    opts: { min?: number; max?: number; step?: number }
  ) => (
    <label key={key} className="block border-gray-200 border rounded p-4 my-1">
      <div className="text-sm font-medium">{label}</div>
      <input
        type="number"
        value={params[key] ?? ""}
        min={opts.min}
        max={opts.max}
        step={opts.step}
        onChange={(e) => handleChange(key, parseFloat(e.target.value || "0"))}
        className="mt-1 block w-full rounded-md border border-gray-400 outline-pes shadow-sm p-2"
      />
      <div className="text-xs text-gray-500">{hint}</div>
    </label>
  );

  const lambdaError = params.lambda >= params.mu && params.lambda > 0 && params.mu > 0;

  return (
    <div>
      <p className="text-gray-600 mb-6">
        Computes the optimal span of control K* that minimises the supervision
        cost function D<sub>ij</sub> (Charles-Owaba, Eq. 8.35).
        Uses the same (M|M|1):(FCFS|K|K) queuing model as the Personnel Utilisation function,
        with two additional cost parameters (a<sub>ij</sub>, b<sub>ij</sub>).
      </p>

      {/* Parameter inputs — 5 parameters (Eq. 8.37) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {numberInput(
          "A",
          "A — Hours scheduled for work in a day",
          "e.g. 8 hours/day",
          { min: 0.1, step: 0.5 }
        )}
        {numberInput(
          "a",
          "a — Unit cost of man-hours spent",
          "Cost associated with subordinate waiting time (Eq. 8.37)",
          { min: 0.01, step: 1 }
        )}
        {numberInput(
          "b",
          "b — Unit cost per wasted boss man-hour",
          "Cost per wasted man-hour of the decision centre head (Eq. 8.37)",
          { min: 0.01, step: 1 }
        )}
        {numberInput(
          "lambda",
          "λ — Arrival rate (cases/hour)",
          "Rate at which subordinates consult the boss (Eq. 8.22: λ = TNC / TTS)",
          { min: 0.001, step: 0.001 }
        )}
        {numberInput(
          "mu",
          "μ — Service rate (cases/hour)",
          "Rate at which the boss processes cases (Eq. 8.24: μ = TCC / Σt). Must be > λ.",
          { min: 0.001, step: 0.001 }
        )}
      </div>

      {lambdaError && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded p-3 mb-4 text-sm">
          <strong>Constraint violated (Eq. 8.9):</strong> λ must be strictly less than μ.
          Currently λ = {params.lambda.toFixed(4)} and μ = {params.mu.toFixed(4)}.
        </div>
      )}



      <button
        onClick={calculate}
        disabled={!isFormValid()}
        className={`px-4 py-2 rounded text-white ${isFormValid() ? "bg-pes hover:bg-blue-900" : "bg-gray-400 cursor-not-allowed"}`}
      >
        Calculate
      </button>

      {result && (
        <>
          {/* Primary results */}
          <div className="bg-white p-4 rounded shadow mb-6 mt-6">
            <h2 className="text-lg font-semibold mb-2">Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Optimal Span (K*)</div>
                <div className="text-2xl font-bold">{result.Kstar}</div>
              </div>
              <div>
                <div className="text-gray-500">Min Supervision Cost (D*)</div>
                <div className="text-2xl font-bold">
                  {Number.isFinite(result.Dstar) ? result.Dstar.toFixed(4) : "NaN"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Traffic Intensity (ρ)</div>
                <div className="text-xl font-semibold">
                  {Number.isFinite(result.rho) ? result.rho.toFixed(6) : "NaN"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">P₀ (Boss idle probability)</div>
                <div className="text-xl font-semibold">
                  {Number.isFinite(result.P0) ? result.P0.toFixed(6) : "NaN"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">L̄ (Avg cases waiting)</div>
                <div className="text-xl font-semibold">
                  {Number.isFinite(result.Lbar) ? result.Lbar.toFixed(6) : "NaN"}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-pes text-white rounded px-4 py-2 hover:opacity-90"
            >
              {saving ? "Saving..." : "Save Result"}
            </button>
          </div>

          {saveMsg && <p className="mt-2 text-sm">{saveMsg}</p>}

          {/* Top candidates table (lowest cost) */}
          <div className="bg-white p-4 rounded shadow mb-6 mt-6">
            <h3 className="font-medium mb-2">Top candidates (lowest cost)</h3>
            <ul className="list-disc list-inside text-sm">
              {result.table
                .filter((r) => Number.isFinite(r.D))
                .sort((a, b) => a.D - b.D)
                .slice(0, 5)
                .map((r) => (
                  <li key={r.K}>
                    K={r.K}, D={r.D.toFixed(4)}
                  </li>
                ))}
            </ul>
          </div>

          {/* D vs K chart */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-2">D vs K (Supervision Cost Curve)</h3>
            <p className="text-xs text-gray-400 mb-4">
              U-shaped concave curve — minimum at K* = {result.Kstar}
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={result.table.map((r) => ({
                    K: r.K,
                    D: Number.isFinite(r.D) ? r.D : null,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="K" label={{ value: "K (Span of Control)", position: "insideBottom", offset: -3 }} />
                  <YAxis domain={["auto", "auto"]} label={{ value: "D (Cost)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value: any) => [Number(value).toFixed(4), "D"]} />
                  <ReferenceLine x={result.Kstar} stroke="red" strokeDasharray="3 3" label={{ value: `K*=${result.Kstar}`, position: "top" }} />
                  <Line
                    type="monotone"
                    dataKey="D"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
