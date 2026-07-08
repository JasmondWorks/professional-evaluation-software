"use client";

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { saveResult } from "../util/sharedPost";
import Link from "next/link";
import { ArrowLeft2 } from "iconsax-react";
import InfoPopover from "@/app/components/ui/InfoPopover";

export default function Method3Page() {
  const [A, setA] = useState<number | "">("");
  const [B, setB] = useState<number | "">("");
  const [confidenceLimit, setConfidenceLimit] = useState<number | "">(95);
  const [utilizationFactor, setUtilizationFactor] = useState<number | "">("");
  const [annualManHours, setAnnualManHours] = useState<number | "">("");
  const [standardManHours, setStandardManHours] = useState<number | "">("");

  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const calculate = async () => {
    setError(null);
    setSaveMsg(null);

    if (!standardManHours || Number(standardManHours) <= 0) {
      setError("⚠️ Standard Man-hours must be greater than zero.");
      return;
    }

    const utilFactorNum = Number(utilizationFactor) || 0;
    const annManHoursNum = Number(annualManHours) || 0;
    const stdManHoursNum = Number(standardManHours);

    // Placeholder simple formula: Staff = (Utilization Factor * Annual Man-hours) / Standard Man-hours
    const staffNeeded = Math.round((utilFactorNum * annManHoursNum) / stdManHoursNum);
    setResult(staffNeeded);
  };

  const saveToDb = async () => {
    if (result === null) return;
    try {
      setSaving(true);
      await saveResult({
        methodType: "Method3",
        staffNeeded: result,
        A: Number(A),
        B: Number(B),
        confidenceLimit: Number(confidenceLimit),
        utilizationFactor: Number(utilizationFactor),
        annualManHours: Number(annualManHours),
        standardManHours: Number(standardManHours),
      });
      setSaveMsg("✅ Record saved successfully!");
    } catch (err) {
      console.error("Failed to save result:", err);
      setSaveMsg("❌ Error saving record");
    } finally {
      setSaving(false);
    }
  };

  const isFilled = A !== "" && B !== "" && utilizationFactor !== "" && annualManHours !== "" && standardManHours !== "";

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

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Model 26C — Work Sampling (Method 3)</h1>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Estimate required staff numbers using sampling variables and standard man-hours.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/staff-number/method2"
            className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            ← Method 2
          </Link>
          <Link
            href="/models/staff-number/history"
            className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            History
          </Link>
        </div>
      </div>

      {/* Robust Sampling Module Callout */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8 shadow-sm flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-indigo-900 mb-1">
            Looking for the full Work Sampling Analysis Tool?
          </h2>
          <p className="text-sm text-indigo-700 mb-4 max-w-3xl">
            This estimation page uses a simplified approximation. The full tool includes multi-month scheduling, randomized observation times, and comprehensive statistical analysis for higher accuracy.
          </p>
          <Link
            href="/evaluation/staff/sampling"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Open Full Work Sampling Tool &rarr;
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Category 1: Duration & Confidence */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Duration & Confidence</h2>
              <p className="text-xs text-gray-500">Observation cycle variables</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Minimum Duration per Cycle (A)</span>
                <InfoPopover text="Minimum time required to complete a single observation cycle." />
              </div>
              <input
                type="number"
                value={A}
                onChange={(e) => setA(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Maximum Possible Duration (B)</span>
                <InfoPopover text="Maximum allocated time permissible for an observation." />
              </div>
              <input
                type="number"
                value={B}
                onChange={(e) => setB(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Confidence Limit (%)</span>
                <InfoPopover text="Statistical confidence limit for the estimates (usually 95%)." />
              </div>
              <input
                type="number"
                value={confidenceLimit}
                onChange={(e) => setConfidenceLimit(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category 2: Utilization Factors */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Utilization & Workload</h2>
              <p className="text-xs text-gray-500">Inputs calculating the required staff capacity</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Utilization Factor</span>
                <InfoPopover text="Expected percentage of active working time vs idle time." />
              </div>
              <input
                type="number"
                value={utilizationFactor}
                onChange={(e) => setUtilizationFactor(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Estimated Annual Man-hours</span>
                <InfoPopover text="Total available man-hours per year across the workforce." />
              </div>
              <input
                type="number"
                value={annualManHours}
                onChange={(e) => setAnnualManHours(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Estimated Standard Man-hours</span>
                <InfoPopover text="Total standard hours required to complete the scheduled work." />
              </div>
              <input
                type="number"
                value={standardManHours}
                onChange={(e) => setStandardManHours(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 font-medium mb-4">{error}</p>}

      <button
        onClick={calculate}
        disabled={!isFilled}
        className={`px-6 py-2 rounded text-white ${isFilled ? "bg-pes hover:bg-blue-900" : "bg-gray-400 cursor-not-allowed"}`}
      >
        Calculate Staff Estimate
      </button>

      {result !== null && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Model Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Estimated Staff Needed</p>
                <p className="text-4xl font-bold text-pes">{result} personnel</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveToDb}
              disabled={saving}
              className="bg-pes text-white rounded px-6 py-2 hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Result"}
            </button>
          </div>

          {saveMsg && <p className="mt-4 text-sm font-medium">{saveMsg}</p>}
        </div>
      )}
    </div>
  );
}
