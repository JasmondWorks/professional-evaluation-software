"use client";

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { saveResult } from "../util/sharedPost";

export default function Method3Page() {
  const [A, setA] = useState<number>(0);
  const [B, setB] = useState<number>(0);
  const [confidenceLimit, setConfidenceLimit] = useState<number>(95);
  const [utilizationFactor, setUtilizationFactor] = useState<number>(0);
  const [annualManHours, setAnnualManHours] = useState<number>(0);
  const [standardManHours, setStandardManHours] = useState<number>(0);

  const [result, setResult] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const decoded: any = jwt.decode(token);
      setRole(decoded?.role || null);
    }
  }, []);

  const isAdmin = role === "super-admin" || role === "admin";

  const calculate = async () => {
    // Placeholder simple formula: Staff = (Utilization Factor * Annual Man-hours) / Standard Man-hours
    const staffNeeded = Math.round((utilizationFactor * annualManHours) / standardManHours);
    setResult(staffNeeded);

    await saveResult({
      methodType: "Method3",
      staffNeeded,
      A,
      B,
      confidenceLimit,
      utilizationFactor,
      annualManHours,
      standardManHours
    });
  };

  return (
    <div className="w-full p-12">
      <div className="border rounded p-4 space-y-4">
        <h1 className="font-semibold text-lg">Method 3: Work Sampling</h1>

        {/* Link to full robust sampling module */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 my-4">
          <h2 className="text-sm font-semibold text-indigo-800 mb-1">Looking for the full Work Sampling Analysis Tool?</h2>
          <p className="text-xs text-indigo-600 mb-3">
            The full tool includes multi-month scheduling, randomized observation times, and comprehensive statistical analysis.
          </p>
          <a
            href="/evaluation/staff/sampling"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors"
          >
            Open Full Work Sampling Tool &rarr;
          </a>
        </div>

        {/* Placeholder PDF Links */}
        {/* <a
          href="/downloadables/work-sampling-table.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-pes text-white rounded hover:opacity-90"
        >
          View Work Sampling Data Collection Table
        </a> */}

        {/* Inputs */}
        <label className="block">
          Minimum Duration per Observation Cycle (A)
          <input
            type="number"
            value={A}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        <label className="block">
          Maximum Possible Duration (B)
          <input
            type="number"
            value={B}
            onChange={(e) => setB(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        <label className="block">
          Confidence Limit (%)
          <input
            type="number"
            value={confidenceLimit}
            onChange={(e) => setConfidenceLimit(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        <label className="block">
          Utilization Factor
          <input
            type="number"
            value={utilizationFactor}
            onChange={(e) => setUtilizationFactor(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        <label className="block">
          Estimated Annual Man-hours
          <input
            type="number"
            value={annualManHours}
            onChange={(e) => setAnnualManHours(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        <label className="block">
          Estimated Standard Man-hours
          <input
            type="number"
            value={standardManHours}
            onChange={(e) => setStandardManHours(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        {/* Calculate Button */}
        <div className="print:hidden">
          {isAdmin ? (
            <button
              onClick={calculate}
              className="px-4 py-2 bg-pes text-white rounded hover:opacity-90"
            >
              Calculate Staff Needed
            </button>
          ) : (
            <p className="text-red-600 font-semibold text-sm">Only admins can perform calculations.</p>
          )}
        </div>

        {result !== null && (
          <div className="p-4 bg-gray-100 rounded font-semibold mt-4 flex items-center justify-between">
            <span>Number of Staff Needed: {result}</span>
            {isAdmin && (
              <button 
                onClick={() => window.print()} 
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm print:hidden"
              >
                Print Result
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
