"use client";
import React, { useState, useEffect } from "react";
import { getAccessToken } from '@/app/utils/auth';
import Link from "next/link";
import { ArrowLeft2 } from "iconsax-react";
import InfoPopover from "@/app/components/ui/InfoPopover";

export default function UtilityIndex() {
  const [used, setUsed] = useState<number | "">("");
  const [given, setGiven] = useState<number | "">("");

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

    if (used === "" || given === "" || Number(given) === 0) {
      setErrorMsg("Please enter valid used and given hours (given cannot be zero).");
      return;
    }

    const index = Number(used) / Number(given);
    setResult(Number(index.toFixed(3)));
  };

  const handleSubmit = async () => {
    if (result === null) return;
    setLoading(true);
    setSuccess(false);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/addPersonnelIndex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          payload: "utility",
          utility: result,
        }),
      });

      if (!res.ok) throw new Error("Failed to save utility index");

      setSuccess(true);
    } catch (err) {
      console.error("Error:", err);
      setErrorMsg("Something went wrong while saving data.");
    } finally {
      setLoading(false);
    }
  };

  const isFilled = used !== "" && given !== "";

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
          <h1 className="text-2xl font-bold mb-2">Model 23 — Utilization Index</h1>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Evaluate the proportion of used hours against the given or allocated hours.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/utility-index/history"
            className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            View History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Man-hour Variables</h2>
              <p className="text-xs text-gray-500">Inputs calculating the utility metric</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Used Hours</span>
                <InfoPopover text="Hours actually spent working or processing tasks." />
              </div>
              <input
                type="number"
                value={used}
                onChange={(e) => setUsed(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Given Hours</span>
                <InfoPopover text="Total hours allocated or available for the period." />
              </div>
              <input
                type="number"
                value={given}
                onChange={(e) => setGiven(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {errorMsg && <p className="text-red-600 font-medium mb-4">{errorMsg}</p>}

      <button
        onClick={evaluateIndex}
        disabled={!isFilled}
        className={`px-6 py-2 rounded text-white ${isFilled ? "bg-pes hover:bg-blue-900" : "bg-gray-400 cursor-not-allowed"}`}
      >
        Evaluate Utilization
      </button>

      {result !== null && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Model Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-1">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Utilization Index</p>
                <p className="text-4xl font-bold text-pes">{result}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
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
