"use client";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import { ArrowLeft2 } from "iconsax-react";
import InfoPopover from "@/app/components/ui/InfoPopover";

type JWTPayload = {
  org?: string;
};

export default function UnitHeadOverloadingPage() {
  const [actualHours, setActualHours] = useState<number | "">("");
  const [numSubs, setNumSubs] = useState<number | "">("");
  const [extraComplexity, setExtraComplexity] = useState<number | "">("");
  const [optimalHours, setOptimalHours] = useState<number | "">("");
  const [optimalK, setOptimalK] = useState<number | "">("");
  
  const [result, setResult] = useState<null | {
    CF: number;
    OR: number;
    status: string;
  }>(null);
  
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // fetch K* and H* defaults
  useEffect(() => {
    const fetchUtilization = async () => {
      try {
        const res = await fetch("/api/personnelUtilization");
        if (!res.ok) throw new Error("Failed to fetch utilization data");
        const data = await res.json();
        if (data?.Kstar) setOptimalK(data.Kstar);
        if (data?.Hstar) setOptimalHours(data.Hstar);
      } catch (err) {
        console.error("Error fetching utilization data:", err);
      }
    };
    fetchUtilization();
  }, []);

  const calculate = () => {
    if (actualHours === "" || numSubs === "" || extraComplexity === "" || optimalHours === "" || optimalK === "") return;

    const CF = 1 + Number(extraComplexity) / Number(numSubs);
    const OR = (Number(actualHours) * CF) / Number(optimalHours);

    let status = "";
    if (OR > 1.05) status = "Overloaded";
    else if (OR < 0.95) status = "Underloaded";
    else status = "Optimal";

    setResult({ CF, OR, status });
    setSaveMsg(null);
  };

  const saveResult = async () => {
    if (!result) return alert("Please calculate before saving");

    try {
      setSaving(true);
      setSaveMsg(null);
      const token = getAccessToken();
      if (!token) {
        setSaveMsg("No access token found. Please log in.");
        return;
      }

      const decoded = jwtDecode<JWTPayload>(token);
      const org = decoded?.org;
      if (!org) {
        setSaveMsg("Invalid token: missing org");
        return;
      }

      const res = await fetch("/api/unitHead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          org,
          actualHours,
          numSubs,
          extraComplexity,
          optimalHours,
          optimalK,
          CF: result.CF,
          OR: result.OR,
          status: result.status,
        }),
      });

      if (!res.ok) throw new Error("Failed to save record");
      setSaveMsg("✅ Record saved successfully!");
    } catch (err) {
      console.error(err);
      setSaveMsg("❌ Error saving record");
    } finally {
      setSaving(false);
    }
  };

  const isFilled = actualHours !== "" && numSubs !== "" && extraComplexity !== "" && optimalHours !== "" && optimalK !== "";

  return (
    <div className="p-8 w-full mx-auto">
      <div className="mb-4 flex gap-4">
        <Link
          href="/models"
          className="inline-flex items-center text-sm text-gray-500 hover:text-pes transition-colors"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Models
        </Link>
      </div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Model 14 — Unit Head Overloading</h1>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Calculates Overload Ratio (OR) using K* and H* values from personnel utilization to determine leadership capacity.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/personnel-utilization"
            className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Personnel Utilization
          </Link>
          <Link
            href="/models/personnel-utilization/unit-head/history"
            className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            View History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Category 1: Supervisory Parameters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Supervisory Parameters</h2>
              <p className="text-xs text-gray-500">Current actual supervisory workload</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Actual Supervisory Hours/Week</span>
                <InfoPopover text="The real number of hours currently spent managing subordinates." />
              </div>
              <input
                type="number"
                value={actualHours}
                onChange={(e) => setActualHours(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Number of Subordinates</span>
                <InfoPopover text="The total headcount directly managed by the unit head." />
              </div>
              <input
                type="number"
                value={numSubs}
                onChange={(e) => setNumSubs(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category 2: Complexity & Optimization Constants */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Constants & Optimization</h2>
              <p className="text-xs text-gray-500">Factors influencing complexity and baseline bounds</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Total Extra Complexity Weight</span>
                <InfoPopover text="Additional weighting based on task difficulty or organizational structure." />
              </div>
              <input
                type="number"
                value={extraComplexity}
                onChange={(e) => setExtraComplexity(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="block w-full min-w-0">
                <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="truncate">Optimal Hrs (H*)</span>
                  <InfoPopover text="Optimal supervisory hours derived from Personnel Utilization (Model 11)." />
                </div>
                <input
                  type="number"
                  value={optimalHours}
                  onChange={(e) => setOptimalHours(e.target.value === "" ? "" : Number(e.target.value))}
                  className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
                />
              </div>
              <div className="block w-full min-w-0">
                <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="truncate">Optimal Personnel (K*)</span>
                  <InfoPopover text="Optimal head count derived from Personnel Utilization (Model 11)." />
                </div>
                <input
                  type="number"
                  value={optimalK}
                  onChange={(e) => setOptimalK(e.target.value === "" ? "" : Number(e.target.value))}
                  className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={calculate}
        disabled={!isFilled}
        className={`px-4 py-2 rounded text-white ${isFilled ? "bg-pes hover:bg-blue-900" : "bg-gray-400 cursor-not-allowed"}`}
      >
        Calculate Ratio
      </button>

      {result && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Model Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500 mb-1">Complexity Factor (CF)</p>
              <p className="text-3xl font-bold text-gray-900">{result.CF.toFixed(3)}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500 mb-1">Overload Ratio (OR)</p>
              <p className="text-3xl font-bold text-pes">{result.OR.toFixed(3)}</p>
            </div>

            <div className={`rounded-xl border p-6 shadow-sm flex flex-col justify-center ${
                result.status === "Overloaded" 
                  ? "bg-red-50 text-red-800 border-red-200" 
                  : result.status === "Underloaded" 
                    ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}>
              <p className="text-sm font-medium opacity-80 mb-1">Status</p>
              <p className="text-3xl font-bold">{result.status}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveResult}
              disabled={saving}
              className="bg-pes text-white rounded px-4 py-2 hover:opacity-90 disabled:opacity-50"
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
