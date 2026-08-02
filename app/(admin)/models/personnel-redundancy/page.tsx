"use client";

import { notify } from "@/lib/toast";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import { ArrowLeft2 } from "iconsax-react";
import InfoPopover from "@/app/components/ui/InfoPopover";
import { apiFetch } from '@/app/utils/apiFetch';

type JWTPayload = {
  org?: string;
  name?: string;
  role?: string;
};

export default function PersonnelRedundancyPage() {
  const [actualStaff, setActualStaff] = useState<number>(0);
  const [optimalStaff, setOptimalStaff] = useState<number>(0);

  const [thresholds, setThresholds] = useState({
    low: 10,
    moderate: 25,
  });

  const [result, setResult] = useState<{
    pr: number;
    rating: string;
    color: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const calculatePR = () => {
    if (actualStaff <= 0 || optimalStaff <= 0) {
      notify.error("Both Actual and Optimal Staff Strength must be greater than 0");
      return;
    }

    const pr = ((actualStaff - optimalStaff) / actualStaff) * 100;
    let rating = "";
    let color = "";

    if (pr < thresholds.low) {
      rating = "Low Redundancy";
      color = "bg-emerald-50 text-emerald-800 border-emerald-200";
    } else if (pr < thresholds.moderate) {
      rating = "Moderate Redundancy";
      color = "bg-yellow-50 text-yellow-800 border-yellow-200";
    } else {
      rating = "High Redundancy";
      color = "bg-red-50 text-red-800 border-red-200";
    }

    setResult({ pr, rating, color });
    setSaveMsg(null);
  };

  const saveToDatabase = async () => {
    try {
      setSaving(true);
      setSaveMsg(null);

      const token = getAccessToken();
      if (!token) {
        setSaveMsg("User not authenticated. Please log in.");
        return;
      }

      const decoded = jwtDecode<JWTPayload>(token);
      const org = decoded.org;

      if (!org) {
        setSaveMsg("Organization not found in token");
        return;
      }

      const response = await apiFetch("/api/personnelRedundancy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          org,
          actual_staff: actualStaff,
          optimal_staff: optimalStaff,
          low_threshold: thresholds.low,
          moderate_threshold: thresholds.moderate,
          pr_value: result?.pr,
          rating: result?.rating,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveMsg("✅ Redundancy data saved successfully!");
      } else {
        setSaveMsg("❌ Failed to save data: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      setSaveMsg("❌ An error occurred while saving data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 w-full mx-auto">
      <div className="mb-4">
        <Link
          href="/models"
          className="inline-flex items-center text-sm text-muted hover:text-pes transition-colors"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Models
        </Link>
      </div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Model 25 — Personnel Redundancy</h1>
          <p className="text-body mb-6 max-w-2xl">
            Determine the Real Percentage Redundancy (PR%) of personnel within a department or organization.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/downloadables/personnel-utilization-table.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-pes text-white px-4 py-2 rounded-md hover:bg-pes-800 font-medium text-sm transition-colors flex items-center gap-2"
          >
            Utilization Table
          </Link>
          <Link
            href="/models/personnel-redundancy/history"
            className="bg-white border border-line shadow-sm text-body px-4 py-2 rounded-md hover:bg-canvas font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            View History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Category 1: Staff Configuration */}
        <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
            <div className="w-8 h-8 rounded-full bg-pes-50 flex items-center justify-center text-pes-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-strong">Staff Configuration</h2>
              <p className="text-xs text-muted">Current and theoretical staff counts</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                <span className="truncate">Actual Staff Strength (A)</span>
                <InfoPopover text="The current number of employees actively working." />
              </div>
              <input
                type="number"
                value={actualStaff}
                onChange={(e) => setActualStaff(Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-line bg-canvas focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                <span className="truncate">Optimal Staff Strength (O)</span>
                <InfoPopover text="The theoretically perfect number of employees for the workload." />
              </div>
              <input
                type="number"
                value={optimalStaff}
                onChange={(e) => setOptimalStaff(Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-line bg-canvas focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category 2: Threshold Bounds */}
        <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-strong">Redundancy Thresholds</h2>
              <p className="text-xs text-muted">Boundaries for classifying redundancy severity</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                <span className="truncate">Low Redundancy (&lt; %)</span>
                <InfoPopover text="Percentage limit for considering redundancy as low." />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  value={thresholds.low}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(e) => setThresholds({ ...thresholds, low: Number(e.target.value) })}
                  className="w-full min-w-0 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pes"
                />
                <input
                  type="number"
                  value={thresholds.low}
                  onChange={(e) => setThresholds({ ...thresholds, low: Number(e.target.value) })}
                  className="w-16 flex-shrink-0 rounded-md border border-line bg-canvas focus:bg-white px-1 py-1.5 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all text-center font-medium"
                />
              </div>
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                <span className="truncate">Moderate Redundancy (&lt; %)</span>
                <InfoPopover text="Percentage limit for considering redundancy as moderate." />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  value={thresholds.moderate}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(e) => setThresholds({ ...thresholds, moderate: Number(e.target.value) })}
                  className="w-full min-w-0 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pes"
                />
                <input
                  type="number"
                  value={thresholds.moderate}
                  onChange={(e) => setThresholds({ ...thresholds, moderate: Number(e.target.value) })}
                  className="w-16 flex-shrink-0 rounded-md border border-line bg-canvas focus:bg-white px-1 py-1.5 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all text-center font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={calculatePR}
        disabled={actualStaff <= 0 || optimalStaff <= 0}
        className={`px-4 py-2 rounded text-white ${actualStaff > 0 && optimalStaff > 0 ? "bg-pes hover:bg-pes-800" : "bg-gray-400 cursor-not-allowed"}`}
      >
        Calculate Redundancy
      </button>

      {result && (
        <div className="mt-8 border-t border-line pt-8">
          <h2 className="text-xl font-bold text-strong mb-6">Model Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* PR% Card */}
            <div className="bg-white rounded-xl border border-line p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted mb-1">Percentage Redundancy (PR%)</p>
                <p className="text-4xl font-bold text-pes">{result.pr.toFixed(2)}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-pes-50 flex items-center justify-center text-pes-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
            </div>

            {/* Rating Card */}
            <div className={`rounded-xl border p-6 shadow-sm flex items-center justify-between ${result.color}`}>
              <div>
                <p className="text-sm font-medium opacity-80 mb-1">Classification Rating</p>
                <p className="text-3xl font-bold">{result.rating}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveToDatabase}
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
