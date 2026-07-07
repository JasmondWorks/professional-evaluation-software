"use client";

import { useState } from "react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from '@/app/utils/auth';

import {
  findOptimalK,
  HParams,
  OptimalKResult,
} from "./lib/util-models11-16";
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

export default function PersonnelUtilizationPage() {
  // Only the 3 true parameters (Eq. 8.10: Θ_ij = {A_ij, λ_ij, μ_ij})
  const [params, setParams] = useState<HParams>({
    A: 8,
    lambda: 1.847,
    mu: 6.5834,
  });
  const [kmin, setKmin] = useState(1);
  const [kmax, setKmax] = useState(30);
  const [result, setResult] = useState<OptimalKResult | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Decode org from JWT
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

  const handleChange = (key: keyof HParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    setResult(null);
  };

  const isFormValid = () => {
    if (!Number.isFinite(params.A) || params.A <= 0) return false;
    if (!Number.isFinite(params.lambda) || params.lambda <= 0) return false;
    if (!Number.isFinite(params.mu) || params.mu <= 0) return false;
    if (params.lambda >= params.mu) return false; // Eq. 8.9: λ < μ
    if (!Number.isFinite(kmin) || !Number.isFinite(kmax) || kmin < 1 || kmax < kmin)
      return false;
    return true;
  };

  const calculate = () => {
    const r = findOptimalK(params, kmin, kmax);
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

      const res = await fetch("/api/personnelUtilization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          org,
          a_ij: params.A,
          lambda: params.lambda,
          mu: params.mu,
          rho: result.rho,
          p0: result.P0,
          lbar: result.Lbar,
          kmin,
          kmax,
          kstar: result.Kstar,
          hstar: result.Hstar,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      setSaveMsg("✅ Saved successfully!");
    } catch (err) {
      console.error(err);
      setSaveMsg("❌ Error saving result.");
    } finally {
      setSaving(false);
    }
  };

  // Input helper
  const numberInput = (
    key: keyof HParams,
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

  // Validation message for λ ≥ μ
  const lambdaError = params.lambda >= params.mu && params.lambda > 0 && params.mu > 0;

  return (
    <div className="p-8 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">Model 11 — Personnel Utilisation</h1>
      <p className="text-gray-600 mb-6">
        Computes the optimal span of control K* that maximises the personnel
        utilisation function H<sub>ij</sub> (Charles-Owaba, Eq. 8.8b).
        Based on an (M|M|1):(FCFS|K|K) queuing model of the decision centre.
      </p>

      {/* Parameter inputs — only the 3 true parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {numberInput(
          "A",
          "A — Hours scheduled for work in a day",
          "e.g. 8 hours/day",
          { min: 0.1, step: 0.5 }
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

      {/* K range */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <label className="block border-gray-200 border rounded p-4">
          <div className="text-sm font-medium">K min</div>
          <input
            type="number"
            value={kmin}
            min={1}
            step={1}
            onChange={(e) => {
              setKmin(Number(e.target.value));
              setResult(null);
            }}
            className="mt-1 block w-full rounded-md border border-gray-400 outline-pes shadow-sm p-2"
          />
          <div className="text-xs text-gray-500">Minimum span of control to search</div>
        </label>
        <label className="block border-gray-200 border rounded p-4">
          <div className="text-sm font-medium">K max</div>
          <input
            type="number"
            value={kmax}
            min={1}
            step={1}
            onChange={(e) => {
              setKmax(Number(e.target.value));
              setResult(null);
            }}
            className="mt-1 block w-full rounded-md border border-gray-400 outline-pes shadow-sm p-2"
          />
          <div className="text-xs text-gray-500">Maximum span of control to search</div>
        </label>
      </div>

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
                <div className="text-gray-500">Max Utilisation (H*)</div>
                <div className="text-2xl font-bold">
                  {Number.isFinite(result.Hstar) ? result.Hstar.toFixed(6) : "NaN"}
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

            <Link
              href="/models/personnel-utilization/unit-head"
              className="bg-gray-100 hover:bg-gray-200 text-blue-700 font-medium px-4 py-2 rounded border border-gray-300"
            >
              ➜ Go to Unit Head Model
            </Link>
          </div>

          {saveMsg && <p className="mt-2 text-sm">{saveMsg}</p>}

          {/* Top candidates table */}
          <div className="bg-white p-4 rounded shadow mb-6 mt-6">
            <h3 className="font-medium mb-2">Top candidates</h3>
            <ul className="list-disc list-inside text-sm">
              {result.table
                .filter((r) => Number.isFinite(r.H))
                .sort((a, b) => b.H - a.H)
                .slice(0, 5)
                .map((r) => (
                  <li key={r.K}>
                    K={r.K}, H={r.H.toFixed(6)}
                  </li>
                ))}
            </ul>
          </div>

          {/* H vs K chart */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-2">H vs K (Utilisation Curve)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={result.table.map((r) => ({
                    K: r.K,
                    H: Number.isFinite(r.H) ? r.H : null,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="K" label={{ value: "K (Span of Control)", position: "insideBottom", offset: -3 }} />
                  <YAxis domain={["auto", "auto"]} label={{ value: "H (Utilisation)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value: any) => [Number(value).toFixed(6), "H"]} />
                  <ReferenceLine x={result.Kstar} stroke="red" strokeDasharray="3 3" label={{ value: `K*=${result.Kstar}`, position: "top" }} />
                  <Line
                    type="monotone"
                    dataKey="H"
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
