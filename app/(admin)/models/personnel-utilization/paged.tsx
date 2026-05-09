"use client";
import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Default param interface
type Params = {
  B: number; // average weekly formal classroom lecture hours (B)
  W: number; // W
  P0: number; // P0
  t1: number;
  t2: number;
  t3: number;
  t4: number;
  S0: number;
  G: number;
  D: number;
  Y: number;
  alpha: number;
};

function computeH(K: number, p: Params): number {
  const { B, W, P0, t1, t2, t3, t4, S0, G, D, Y, alpha } = p;

  // Numerator terms (from PDF around eq.37)
  const termA = K * (B - W); // K(B - W)
  const termB = B * (1 - P0) + t4 * K; // B(1-P0) + t4 K
  const termC = (1 - S0) * G - D; // (1 - S0)G - D
  const numerator = t1 * termA + t2 * termB + termC;

  // Denominator (from surrounding text; includes D - Y*alpha and G-D)
  // PDF shows K*(D - Y*alpha) + t3*(D - Y*alpha) + (G - D)
  const denomBase = D - Y * alpha;
  const denominator = K * denomBase + t3 * denomBase + (G - D);

  if (!isFinite(numerator) || !isFinite(denominator) || denominator === 0) return NaN;

  return numerator / denominator;
}

function findOptimalK(params: Params, kmin: number, kmax: number) {
  let bestK = kmin;
  let bestH = -Infinity;
  const list: { K: number; H: number }[] = [];

  for (let K = kmin; K <= kmax; K++) {
    const h = computeH(K, params);
    list.push({ K, H: Number.isFinite(h) ? h : NaN });
    if (Number.isFinite(h) && h > bestH) {
      bestH = h;
      bestK = K;
    }
  }

  return { Kstar: bestK, Hstar: bestH, values: list };
}

export default function Page() {
  const [params, setParams] = useState<Params>({
    B: 10,
    W: 2,
    P0: 0.1,
    t1: 1,
    t2: 1,
    t3: 1,
    t4: 0.5,
    S0: 0.1,
    G: 40,
    D: 8,
    Y: 0,
    alpha: 0,
  });

  const [kmin, setKmin] = useState(5);
  const [kmax, setKmax] = useState(200);

  const { result, values } = useMemo(() => {
    const r = findOptimalK(params, Math.max(1, kmin), Math.max(kmin, kmax));
    return { result: r, values: r.values };
  }, [params, kmin, kmax]);

  const handleParamChange = (key: keyof Params, value: number) => {
    setParams((s) => ({ ...s, [key]: value }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Personnel Utilization — H<sub>ij</sub></h1>
      <p className="text-sm text-gray-600 mb-6">
        Implements the H(t,K)-style utilization model (from your PDF). Enter parameters, choose
        integer K range, and the tool will perform a discrete search for optimal K*.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="font-semibold mb-3">Parameters</h2>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["B", params.B],
                ["W", params.W],
                ["P0", params.P0],
                ["t1", params.t1],
                ["t2", params.t2],
                ["t3", params.t3],
                ["t4", params.t4],
                ["S0", params.S0],
                ["G", params.G],
                ["D", params.D],
                ["Y", params.Y],
                ["alpha", params.alpha],
              ] as [keyof Params, number][]
            ).map(([k, v]) => (
              <label key={k} className="block">
                <div className="text-xs text-gray-700">{k}</div>
                <input
                  type="number"
                  step="any"
                  value={v}
                  onChange={(e) => handleParamChange(k, parseFloat(e.target.value || "0"))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                />
              </label>
            ))}

            <label className="block">
              <div className="text-xs text-gray-700">K min</div>
              <input
                type="number"
                value={kmin}
                onChange={(e) => setKmin(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              />
            </label>
            <label className="block">
              <div className="text-xs text-gray-700">K max</div>
              <input
                type="number"
                value={kmax}
                onChange={(e) => setKmax(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              />
            </label>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Constraints note: The PDF lists constraints (eqs.39–42). This tool does not currently
            enforce them — it performs an unconstrained discrete search. If you want those enforced,
            I can add constraint checks and filter candidate K values.
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="font-semibold mb-3">Results</h2>
          <div className="mb-3">
            <div className="text-sm text-gray-700">Optimal K*</div>
            <div className="text-xl font-bold">
              {result?.Kstar ?? "-"} <span className="text-gray-500 text-sm">(H*={Number.isFinite(result?.Hstar) ? result?.Hstar.toFixed(4) : "NaN"})</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={values.map((v) => ({ K: v.K, H: Number.isFinite(v.H) ? v.H : null }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="K" />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Line type="monotone" dataKey="H" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3">
            <h3 className="text-sm font-medium">Top candidates</h3>
            <ol className="list-decimal list-inside text-sm">
              {values
                .slice()
                .sort((a, b) => (isNaN(a.H) ? -Infinity : a.H) > (isNaN(b.H) ? -Infinity : b.H) ? -1 : 1)
                .slice(0, 6)
                .map((v) => (
                  <li key={v.K}>
                    K={v.K} — H={Number.isFinite(v.H) ? v.H.toFixed(5) : "NaN"}
                  </li>
                ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow-sm">
        <h3 className="font-semibold mb-2">How to use</h3>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          <li>Set realistic parameter values from your study (B, W, G, D, etc.).</li>
          <li>Pick a sensible integer K range — the search is discrete.</li>
          <li>If you want constraints enforced (eqs.39–42), tell me and I will wire them in.</li>
        </ul>
      </div>
    </div>
  );
}
