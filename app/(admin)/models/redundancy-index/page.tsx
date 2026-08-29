"use client";
import React, { useState, useEffect } from "react";
import { getAccessToken } from '@/app/utils/auth';
import Link from "next/link";

import InfoPopover from "@/app/components/ui/InfoPopover";
import HistoryPicker from "@/app/components/models/HistoryPicker";
import { apiFetch } from '@/app/utils/apiFetch';
import { BackLink, Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui';
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

// Two models share this page because they share a queueing core: the redundancy
// ratio reports wasted man-hours after the fact, while Supervision Cost (Eq.
// 8.35) picks the span of control K* that minimises the cost of producing them.
export default function RedundancyIndexPage() {
  return (
    <div className="p-8 w-full mx-auto">
      <div className="mb-4">
        <BackLink href="/models">Back to Models</BackLink>
      </div>

      <Tabs defaultValue="redundancy" syncParam="tab">
        <TabsList className="mb-8">
          <TabsTrigger value="redundancy">Redundancy Index</TabsTrigger>
          <TabsTrigger value="cost">Supervision Cost</TabsTrigger>
        </TabsList>

        <TabsContent value="redundancy">
          <RedundancyTab />
        </TabsContent>
        <TabsContent value="cost">
          <SupervisionCostTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RedundancyTab() {
  const [wasted, setWasted] = useState<number | "">("");
  const [total, setTotal] = useState<number | "">("");

  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userToken, setUserToken] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) setUserToken(token);
  }, []);

  const evaluateIndex = () => {
    setErrorMsg(null);
    setSuccess(false);

    if (wasted === "" || total === "" || Number(total) === 0) {
      setErrorMsg("Please enter valid wasted and total hours (total cannot be zero).");
      return;
    }

    const index = Number(wasted) / Number(total);
    setResult(Number(index.toFixed(4)));
  };

  const handleSubmit = async () => {
    if (result === null) return;
    setLoading(true);
    setSuccess(false);
    setErrorMsg(null);

    try {
      const res = await apiFetch("/api/addPersonnelIndex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          payload: "redundancy",
          redundancy: result,
        }),
      });

      if (!res.ok) throw new Error("Failed to save redundancy index");

      setSuccess(true);
    } catch (err) {
      console.error("Error:", err);
      setErrorMsg("Something went wrong while saving data.");
    } finally {
      setLoading(false);
    }
  };

  const isFilled = wasted !== "" && total !== "";

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Model 24 — Redundancy Index</h1>
          <p className="text-body mb-6 max-w-2xl">
            Evaluate the proportion of wasted man-hours against the total establishment capacity.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/redundancy-index/history"
            className="bg-white border border-line shadow-sm text-body px-4 py-2 rounded-md hover:bg-canvas font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            View History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-strong">Man-hour Variables</h2>
              <p className="text-xs text-muted">Inputs calculating the redundancy metric</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="block w-full min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center text-sm font-semibold text-body">
                  <span className="truncate">Wasted Man-hours</span>
                  <InfoPopover text="Hours lost due to delays, idleness, or lack of tasks. D* from a Supervision Cost run is the minimum-cost figure." />
                </div>
                {/* The client asked to be able to pull D* from the Supervision
                    Cost history rather than copy it across by hand, since that
                    is where the minimum-cost figure is computed. */}
                <HistoryPicker<{
                  id: number;
                  created_at: string;
                  Kstar: number | null;
                  Dstar: number | null;
                  lambda: number | null;
                  mu: number | null;
                }>
                  source="supervision-cost"
                  label="Fill D* from history"
                  columns={[
                    { label: "D* (min)", render: (r) => (r.Dstar == null ? "—" : Number(r.Dstar).toFixed(4)) },
                    { label: "K*", render: (r) => r.Kstar ?? "—" },
                    { label: "\u03bb", render: (r) => (r.lambda == null ? "—" : Number(r.lambda).toFixed(4)) },
                    { label: "\u03bc", render: (r) => (r.mu == null ? "—" : Number(r.mu).toFixed(4)) },
                  ]}
                  onSelect={(run) => {
                    if (run.Dstar != null) setWasted(Number(run.Dstar));
                  }}
                />
              </div>
              <input
                type="number"
                value={wasted}
                onChange={(e) => setWasted(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-pes-400 focus:shadow-focus outline-none transition-shadow"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                <span className="truncate">Total Establishment Man-hours</span>
                <InfoPopover text="Total available man-hours across the organization or department." />
              </div>
              <input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-pes-400 focus:shadow-focus outline-none transition-shadow"
              />
            </div>
          </div>
        </div>
      </div>

      {errorMsg && <p className="text-danger-600 font-medium mb-4">{errorMsg}</p>}

      <button
        onClick={evaluateIndex}
        disabled={!isFilled}
        className={`px-6 py-2 rounded text-white ${isFilled ? "bg-pes hover:bg-pes-800" : "bg-gray-400 cursor-not-allowed"}`}
      >
        Evaluate Redundancy
      </button>

      {result !== null && (
        <div className="mt-8 border-t border-line pt-8">
          <h2 className="text-xl font-bold text-strong mb-6">Model Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-line p-6 shadow-sm flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-1">
              <div>
                <p className="text-sm font-medium text-muted mb-1">Redundancy Index</p>
                <p className="text-4xl font-bold text-pes">{result}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-pes-50 flex items-center justify-center text-pes-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-pes text-white rounded px-6 py-2 hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Result"}
            </button>
          </div>

          {success && <p className="mt-4 text-sm font-medium text-green-600">✅ Successfully saved.</p>}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Supervision Cost — Wasted Man-Hour Cost Function (Eq. 8.35)
// (Charles-Owaba, Ch. 8, Section 4)
//
// Same (M|M|1):(FCFS|K|K) queue as Personnel Utilisation, with two extra cost
// parameters. Where that model maximises H_ij, this one minimises D_ij — the
// search walks K upward and stops once the curve has clearly turned.
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

  const calculate = () => setResult(findOptimalKCost(params));

  const handleSave = async () => {
    // The params can be edited after Calculate ran, so the result on screen is
    // not proof the rule still holds. Re-check at the point of writing.
    if (params.lambda >= params.mu) {
      setSaveMsg("Cannot save: λ must be strictly less than μ.");
      return;
    }
    if (!result) return;
    setSaving(true);
    setSaveMsg(null);

    try {
      const token = getAccessToken();
      if (!token) {
        setSaveMsg("Missing token — please log in again.");
        setSaving(false);
        return;
      }

      // org is derived from the token server-side, so it is not sent here.
      const res = await apiFetch("/api/supervisionCost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
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
      setSaveMsg("✅ Saved successfully.");
    } catch (err) {
      console.error(err);
      setSaveMsg("❌ Error saving result.");
    } finally {
      setSaving(false);
    }
  };

  const numberInput = (
    key: keyof DParams,
    label: string,
    hint: string,
    opts: { min?: number; step?: number },
  ) => (
    <div key={key} className="block w-full min-w-0">
      <div className="flex items-center text-sm font-semibold text-body mb-1.5">
        <span className="truncate">{label}</span>
        <InfoPopover text={hint} />
      </div>
      <input
        type="number"
        value={params[key] ?? ""}
        min={opts.min}
        step={opts.step}
        onChange={(e) => handleChange(key, parseFloat(e.target.value || "0"))}
        className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-pes-400 focus:shadow-focus outline-none transition-shadow"
      />
    </div>
  );

  const lambdaError =
    params.lambda >= params.mu && params.lambda > 0 && params.mu > 0;

  const stat = (label: string, value: number | null, digits: number) => (
    <div>
      <p className="text-sm font-medium text-muted mb-1">{label}</p>
      <p className="text-xl font-semibold text-strong">
        {value !== null && Number.isFinite(value) ? value.toFixed(digits) : "—"}
      </p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Supervision Cost</h1>
          <p className="text-body mb-6 max-w-2xl">
            Computes the span of control K* that minimises the supervision cost
            function D<sub>ij</sub> (Eq. 8.35) — the same queueing model as
            Personnel Utilisation, with a cost per waiting subordinate hour and
            a cost per wasted hour of the decision centre head.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/redundancy-index/supervision-cost-history"
            className="bg-white border border-line shadow-sm text-body px-4 py-2 rounded-md hover:bg-canvas font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            View History
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-line p-6 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
          <div className="w-8 h-8 rounded-full bg-pes-50 flex items-center justify-center text-pes-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 9v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-strong">Cost Parameters</h2>
            <p className="text-xs text-muted">Θ_c = {"{"} A, a, b, λ, μ {"}"} — Eq. 8.37</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {numberInput("A", "A — Hours scheduled per day", "Hours scheduled for work in a day, e.g. 8.", { min: 0.1, step: 0.5 })}
          {numberInput("a", "a — Unit cost of man-hours spent", "Cost associated with subordinate waiting time (Eq. 8.37).", { min: 0.01, step: 1 })}
          {numberInput("b", "b — Unit cost per wasted boss man-hour", "Cost per wasted man-hour of the decision centre head (Eq. 8.37).", { min: 0.01, step: 1 })}
          {numberInput("lambda", "λ — Arrival rate (cases/hour)", "Rate at which subordinates consult the boss (Eq. 8.22: λ = TNC / TTS).", { min: 0.001, step: 0.001 })}
          {numberInput("mu", "μ — Service rate (cases/hour)", "Rate at which the boss processes cases (Eq. 8.24: μ = TCC / Σt). Must exceed λ.", { min: 0.001, step: 0.001 })}
        </div>
      </div>

      {lambdaError && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 rounded-lg p-3 mb-4 text-sm">
          <strong>Constraint violated (Eq. 8.9):</strong> λ must be strictly less
          than μ. Currently λ = {params.lambda.toFixed(4)} and μ ={" "}
          {params.mu.toFixed(4)}.
        </div>
      )}

      <button
        onClick={calculate}
        disabled={!isFormValid()}
        className={`px-6 py-2 rounded text-white ${
          isFormValid() ? "bg-pes hover:bg-pes-800" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Calculate
      </button>

      {result && (
        <div className="mt-8 border-t border-line pt-8">
          <h2 className="text-xl font-bold text-strong mb-6">Model Results</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-line p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted mb-1">Optimal Span (K*)</p>
                <p className="text-4xl font-bold text-pes">{result.Kstar}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted mb-1">Min Supervision Cost (D*)</p>
                <p className="text-4xl font-bold text-strong">
                  {Number.isFinite(result.Dstar) ? result.Dstar.toFixed(4) : "—"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-line p-6 shadow-sm grid grid-cols-3 gap-4">
              {stat("Traffic intensity (ρ)", result.rho, 6)}
              {stat("P₀ — boss idle", result.P0, 6)}
              {stat("L̄ — avg waiting", result.Lbar, 6)}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleSave}
              disabled={saving || lambdaError}
              title={lambdaError ? "λ must be strictly less than μ" : undefined}
              className="bg-pes text-white rounded px-6 py-2 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Result"}
            </button>
            {saveMsg && <p className="text-sm font-medium">{saveMsg}</p>}
          </div>

          <div className="bg-white rounded-xl border border-line p-6 shadow-sm mb-6">
            <h3 className="font-bold text-strong mb-3">Top candidates (lowest cost)</h3>
            <ul className="list-disc list-inside text-sm text-body space-y-1">
              {result.table
                .filter((r) => Number.isFinite(r.D))
                .sort((a, b) => a.D - b.D)
                .slice(0, 5)
                .map((r) => (
                  <li key={r.K}>
                    K = {r.K}, D = {r.D.toFixed(4)}
                  </li>
                ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
            <h3 className="font-bold text-strong mb-1">D vs K — supervision cost curve</h3>
            <p className="text-xs text-muted mb-4">
              U-shaped curve, minimum at K* = {result.Kstar}
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
                  <XAxis
                    dataKey="K"
                    label={{ value: "K (span of control)", position: "insideBottom", offset: -3 }}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    label={{ value: "D (cost)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip formatter={(value: any) => [Number(value).toFixed(4), "D"]} />
                  <ReferenceLine
                    x={result.Kstar}
                    stroke="#dc2626"
                    strokeDasharray="3 3"
                    label={{ value: `K*=${result.Kstar}`, position: "top" }}
                  />
                  <Line type="monotone" dataKey="D" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
