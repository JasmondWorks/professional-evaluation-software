"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft2 } from "iconsax-react";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from "@/app/utils/auth";

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
import InfoPopover from "@/app/components/ui/InfoPopover";

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
      const token = getAccessToken();
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
    if (
      !Number.isFinite(kmin) ||
      !Number.isFinite(kmax) ||
      kmin < 1 ||
      kmax < kmin
    )
      return false;
    return true;
  };

  const calculate = () => {
    const r = findOptimalK(params, kmin, kmax);
    const fails: string[] = [];
    if (!pdfConstraintsOk(r.Kstar, { ...params, K: r.Kstar })) {
      const { t3 = 1, t4 = 0, D = 0, Y, alpha, W, lambda, mu, J, G } = params;
      const rhs39 =
        Y !== undefined && alpha !== undefined ? t3 * (D - Y * alpha) : t3 * D;
      if (!(t4 * r.Kstar <= rhs39))
        fails.push("Eq.39 fails: t4*K > t3*(D - Yα)");
      const rhs40 =
        Y !== undefined && alpha !== undefined ? t3 * (D - Y * alpha) : t3 * D;
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
    opts: { min?: number; max?: number; step?: number },
  ) => (
    <div key={key} className="block w-full min-w-0">
      <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
        <span className="truncate">{label}</span>
        <InfoPopover text={hint} />
      </div>
      {opts.max !== undefined ? (
        <div className="flex items-center gap-2">
          <input
            type="range"
            value={params[key] ?? 0}
            min={opts.min}
            max={opts.max}
            step={opts.step}
            onChange={(e) => handleChange(key, parseFloat(e.target.value || "0"))}
            className="w-full min-w-0 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pes"
          />
          <input
            type="number"
            value={params[key] ?? ""}
            min={opts.min}
            max={opts.max}
            step={opts.step}
            onChange={(e) => handleChange(key, parseFloat(e.target.value || "0"))}
            className="w-16 flex-shrink-0 rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-1 py-1.5 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all text-center font-medium"
          />
        </div>
      ) : (
        <input
          type="number"
          value={params[key] ?? ""}
          min={opts.min}
          max={opts.max}
          step={opts.step}
          onChange={(e) => handleChange(key, parseFloat(e.target.value || "0"))}
          className="block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
        />
      )}
    </div>
  );

  return (
    <div className="p-8 w-full mx-auto">
      <div className="mb-4">
        <Link
          href="/models"
          className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Models
        </Link>
      </div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Model 11 — Personnel Utilization
          </h1>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Calculate optimal K* for a decision centre with given workload
            parameters. Based on H(t,K), with optional constraints (eqs.39–42).
          </p>
        </div>
        <Link
          href="/models/personnel-utilization/history"
          className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          View History & Reports
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category 1: Workload & Time Allocation */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Workload & Time Allocation
              </h2>
              <p className="text-xs text-gray-500">
                Core hours and operational timeline parameters
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {numberInput(
              "B",
              "B — Formal lecture hours",
              "Hours/week in formal class time",
              { min: 0, step: 0.1 },
            )}
            {numberInput(
              "W",
              "W — Workload offset",
              "Hours/week lost to interruptions/admin",
              { min: 0, step: 0.1 },
            )}
            {numberInput(
              "G",
              "G — Total available hours",
              "Weekly total hours outside class",
              { min: 0, step: 0.1 },
            )}
            {numberInput(
              "D",
              "D — Decision tasks hours",
              "Weekly hours allocated to decision tasks",
              { min: 0, step: 0.1 },
            )}
          </div>
        </div>

        {/* Category 2: Proportions & Activity Constants */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                ></path>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Proportions & Activity
              </h2>
              <p className="text-xs text-gray-500">
                Percentages and fractional coefficients (0-1)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {numberInput("P0", "P₀ — Preliminary work", "0–1", {
              min: 0,
              max: 1,
              step: 0.01,
            })}
            {numberInput("S0", "S₀ — Secondary duties", "0–1", {
              min: 0,
              max: 1,
              step: 0.01,
            })}
            {numberInput("alpha", "α — Activity proportion", "0–1", {
              min: 0,
              max: 1,
              step: 0.01,
            })}
            {numberInput("Y", "Y — Coefficient for α", "0–1", {
              min: 0,
              max: 1,
              step: 0.01,
            })}
          </div>
        </div>

        {/* Category 3: Weighting Constants */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                ></path>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Weighting Constants
              </h2>
              <p className="text-xs text-gray-500">
                Algorithmic multipliers (t₁ - t₄)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {numberInput("t1", "t₁ — Constant 1", "Default 1", {
              min: 0,
              step: 0.1,
            })}
            {numberInput("t2", "t₂ — Constant 2", "Default 1", {
              min: 0,
              step: 0.1,
            })}
            {numberInput("t3", "t₃ — Constant 3", "Default 1", {
              min: 0,
              step: 0.1,
            })}
            {numberInput("t4", "t₄ — Constant 4", "Default 0.2", {
              min: 0,
              step: 0.1,
            })}
          </div>
        </div>

        {/* Category 4: Advanced Constraints */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                ></path>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Advanced Constraints
              </h2>
              <p className="text-xs text-gray-500">
                Parameters for equations 41 & 42
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {numberInput("lambda", "λ (Eq.41)", "0–1", {
              min: 0,
              max: 1,
              step: 0.01,
            })}
            {numberInput("mu", "μ (Eq.41)", "0–1", {
              min: 0,
              max: 1,
              step: 0.01,
            })}
            {numberInput("J", "J (Eq.42)", "Hours", { min: 0, step: 0.1 })}
          </div>
        </div>
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
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Model Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* K* Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Optimal Personnel (K*)
                  </p>
                  <p className="text-4xl font-bold text-pes">{result.Kstar}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* H* Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Efficiency Ratio (H*)
                  </p>
                  <p className="text-4xl font-bold text-emerald-600">
                    {Number.isFinite(result.Hstar)
                      ? result.Hstar.toFixed(5)
                      : "NaN"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Constraints Alert */}
            {violations && violations.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-start">
                <svg
                  className="w-5 h-5 text-emerald-500 mt-0.5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-emerald-800">
                    Constraints Satisfied
                  </h3>
                  <p className="text-sm text-emerald-600 mt-1">
                    The calculated K* value successfully meets all mathematical
                    bounds and constraints.
                  </p>
                </div>
              </div>
            ) : violations && violations.length > 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Constraints Violation Warning
                  </h3>
                  <p className="text-sm text-red-600 mt-1 mb-2">
                    The calculated K* value failed the following boundary
                    checks:
                  </p>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {violations.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
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
