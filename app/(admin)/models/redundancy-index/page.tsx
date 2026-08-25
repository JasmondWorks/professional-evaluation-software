"use client";
import React, { useState, useEffect } from "react";
import { getAccessToken } from '@/app/utils/auth';
import Link from "next/link";

import InfoPopover from "@/app/components/ui/InfoPopover";
import { apiFetch } from '@/app/utils/apiFetch';
import { BackLink } from '@/app/components/ui';

export default function RedundancyIndex() {
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
    <div className="p-8 w-full mx-auto">
      <div className="mb-4">
        <BackLink href="/models">Back to Models</BackLink>
      </div>

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
              <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                <span className="truncate">Wasted Man-hours</span>
                <InfoPopover text="Hours lost due to delays, idleness, or lack of tasks." />
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
