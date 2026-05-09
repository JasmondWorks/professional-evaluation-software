"use client";

import { useState } from "react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import {
  findOptimalK,
  pdfConstraintsOk,
  HParamsWithConstraints,
} from "./lib/util-models11-16";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PersonnelUtilizationPage() {
  const [params, setParams] = useState<HParamsWithConstraints>({
    K: 1,
    B: 12,
    W: 2,
    P0: 0.1,
    t1: 1,
    t2: 1,
    t3: 1,
    t4: 0.2,
    S0: 0.05,
    G: 40,
    D: 8,
    Y: 0.5,
    alpha: 0.8,
    lambda: 0.3,
    mu: 0.5,
    J: 5,
  });
  const [kmin, setKmin] = useState(1);
  const [kmax, setKmax] = useState(60);
  const [usePdfConstraints, setUsePdfConstraints] = useState(true);
  const [result, setResult] = useState<null | {
    Kstar: number;
    Hstar: number;
    table: { K: number; H: number; admissible: boolean }[];
  }>(null);
  const [violations, setViolations] = useState<string[] | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Decode org from JWT
  const getOrgFromToken = () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return null;
      const decoded: any = jwtDecode(token);
      return decoded?.org || null;
    } catch {
      return null;
    }
  };

  const handleChange = (key: keyof HParamsWithConstraints, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    setResult(null);
    setViolations(null);
  };

  const isFormValid = () => {
    const fields = [
      "B",
      "W",
      "P0",
      "t1",
      "t2",
      "t3",
      "t4",
      "S0",
      "G",
      "D",
      "Y",
      "alpha",
      "lambda",
      "mu",
      "J",
    ];
    for (let f of fields) {
      const val = (params as any)[f];
      if (val === undefined || val === null || Number.isNaN(val)) return false;
    }
    if (!Number.isFinite(kmin) || !Number.isFinite(kmax) || kmin < 1 || kmax < kmin)
      return false;
    return true;
  };

  const calculate = () => {
    const r = findOptimalK(params, kmin, kmax);
    const fails: string[] = [];
    if (!pdfConstraintsOk(r.Kstar, { ...params, K: r.Kstar })) {
      const { t3 = 1, t4 = 0, D = 0, Y, alpha, W, lambda, mu, J, G } = params;
      const rhs39 = Y !== undefined && alpha !== undefined ? t3 * (D - Y * alpha) : t3 * D;
      if (!(t4 * r.Kstar <= rhs39)) fails.push("Eq.39 fails: t4*K > t3*(D - Yα)");
      const rhs40 = Y !== undefined && alpha !== undefined ? t3 * (D - Y * alpha) : t3 * D;
      if (!(W! <= rhs40)) fails.push("Eq.40 fails: W > t3*(D - Yα)");
      if (lambda !== undefined && mu !== undefined && !(lambda <= mu))
        fails.push("Eq.41 fails: λ > μ");
      if (J !== undefined && G !== undefined && !(J <= G - D))
        fails.push("Eq.42 fails: J > (G - D)");
    }
    setResult(r);
    setViolations(fails);
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
      const token = localStorage.getItem("access_token");
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
          Kstar: result.Kstar,
          Hstar: result.Hstar,
          params,
          result,
          kmax,
          kmin,
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

  const numberInput = (
    key: keyof HParamsWithConstraints,
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

  return (
    <div className="p-8 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">Model 11 — Personnel Utilization</h1>
      <p className="text-gray-600 mb-6">
        Calculate optimal K* for a decision centre with given workload parameters.
        Based on H(t,K), with optional constraints (eqs.39–42).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {numberInput("B", "B — Avg. weekly formal lecture hours", "Hours/week in formal class time", { min: 0, step: 0.1 })}
        {numberInput("W", "W — Workload offset/lost time", "Hours/week lost to interruptions/admin", { min: 0, step: 0.1 })}
        {numberInput("P0", "P₀ — Proportion preliminary work", "0–1", { min: 0, max: 1, step: 0.01 })}
        {numberInput("t1", "t₁ — Weighting constant 1", "Default 1", { min: 0, step: 0.1 })}
        {numberInput("t2", "t₂ — Weighting constant 2", "Default 1", { min: 0, step: 0.1 })}
        {numberInput("t3", "t₃ — Weighting constant 3", "Default 1", { min: 0, step: 0.1 })}
        {numberInput("t4", "t₄ — Weighting constant 4", "Default 0.2", { min: 0, step: 0.1 })}
        {numberInput("S0", "S₀ — Secondary duties proportion", "0–1", { min: 0, max: 1, step: 0.01 })}
        {numberInput("G", "G — Total available hours outside class", "Weekly total hours", { min: 0, step: 0.1 })}
        {numberInput("D", "D — Hours allocated to decision tasks", "Weekly total hours", { min: 0, step: 0.1 })}
        {numberInput("Y", "Y — Coefficient for α in denom", "0–1", { min: 0, max: 1, step: 0.01 })}
        {numberInput("alpha", "α — Activity proportion constant", "0–1", { min: 0, max: 1, step: 0.01 })}
        {numberInput("lambda", "λ — Eq.41 parameter", "0–1", { min: 0, max: 1, step: 0.01 })}
        {numberInput("mu", "μ — Eq.41 parameter", "0–1", { min: 0, max: 1, step: 0.01 })}
        {numberInput("J", "J — Eq.42 parameter", "Hours", { min: 0, step: 0.1 })}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={usePdfConstraints}
            onChange={(e) => {
              setUsePdfConstraints(e.target.checked);
              setResult(null);
              setViolations(null);
            }}
          />
          Use PDF constraints (eqs.39–42)
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
          <div className="bg-white p-4 rounded shadow mb-6 mt-6">
            <h2 className="text-lg font-semibold mb-2">Results</h2>
            <p>
              <strong>K*:</strong> {result.Kstar} &nbsp;
              <strong>H*:</strong> {Number.isFinite(result.Hstar) ? result.Hstar.toFixed(5) : "NaN"}
            </p>
            {violations && violations.length === 0 ? (
              <p className="text-green-600 text-sm">Constraints satisfied for K*</p>
            ) : violations && violations.length > 0 ? (
              <div className="text-red-600 text-sm">
                Constraints NOT satisfied for K*:
                <ul className="list-disc list-inside">
                  {violations.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-pes text-white rounded px-4 py-2 hover:opacity-90"
            >
              {saving ? "Saving..." : "Save Result"}
            </button>

            {/* 🔗 Show link here when results exist */}
            <Link
              href="/models/personnel-utilization/unit-head"
              className="bg-gray-100 hover:bg-gray-200 text-blue-700 font-medium px-4 py-2 rounded border border-gray-300"
            >
              ➜ Go to Unit Head Model
            </Link>
          </div>

          {saveMsg && <p className="mt-2 text-sm">{saveMsg}</p>}

          <div className="bg-white p-4 rounded shadow mb-6 mt-6">
            <h3 className="font-medium mb-2">Top candidates</h3>
            <ul className="list-disc list-inside text-sm">
              {result.table
                .filter((r) => r.admissible)
                .sort((a, b) => b.H - a.H)
                .slice(0, 5)
                .map((r) => (
                  <li key={r.K}>
                    K={r.K}, H={r.H.toFixed(5)}
                  </li>
                ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-2">H vs K</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.table.map((r) => ({ K: r.K, H: r.H }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="K" />
                  <YAxis />
                  <Tooltip />
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
