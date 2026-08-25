"use client";

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { saveResult } from "../util/sharedPost";
import Link from "next/link";

import InfoPopover from "@/app/components/ui/InfoPopover";
import { BackLink } from '@/app/components/ui';

export default function Method2Page() {
  const [observedTime, setObservedTime] = useState<number | "">("");
  const [estimatedTime, setEstimatedTime] = useState<number | "">("");
  const [correctiveFactor, setCorrectiveFactor] = useState<number | "">("");
  const [personsEstimate, setPersonsEstimate] = useState<number | "">("");
  const [numTasks, setNumTasks] = useState<number | "">("");
  const [relaxAllowance, setRelaxAllowance] = useState<number | "">("");
  const [availableHoursPerPerson, setAvailableHoursPerPerson] = useState<number | "">("");

  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const calculate = async () => {
    setError(null);
    setSaveMsg(null);

    if (!availableHoursPerPerson || Number(availableHoursPerPerson) <= 0) {
      setError("⚠️ Available Man-hours per Person must be greater than zero.");
      return;
    }
    
    const obsTimeNum = Number(observedTime);
    const estTimeNum = Number(estimatedTime);
    const corrFactorNum = Number(correctiveFactor) || 0;
    const personsEstNum = Number(personsEstimate);
    const numTasksNum = Number(numTasks);
    const relaxNum = Number(relaxAllowance) || 0;
    const availHoursNum = Number(availableHoursPerPerson);

    // Corrected estimate
    const correctedEstimate = personsEstNum * (1 + corrFactorNum);
    // Basic time (average of observed and estimated times, as placeholder logic)
    const basicTime = ((obsTimeNum + estTimeNum) / 2) * correctedEstimate;
    // Standard man-hours of a task
    const standardManHoursPerTask = basicTime * (1 + relaxNum / 100);
    // Total standard man-hours
    const totalStandardManHours = standardManHoursPerTask * numTasksNum;
    // Staff needed
    const staffNeeded = Math.round(totalStandardManHours / availHoursNum);

    setResult(staffNeeded);
  };

  const saveToDb = async () => {
    if (result === null) return;
    try {
      setSaving(true);
      await saveResult({
        methodType: "Method2",
        staffNeeded: result,
        observedTime: Number(observedTime),
        estimatedTime: Number(estimatedTime),
        correctiveFactor: Number(correctiveFactor),
        personsEstimate: Number(personsEstimate),
        numTasks: Number(numTasks),
        relaxAllowance: Number(relaxAllowance),
        availableHoursPerPerson: Number(availableHoursPerPerson),
      });
      setSaveMsg("✅ Record saved successfully!");
    } catch (err) {
      console.error("Failed to save result:", err);
      setSaveMsg("❌ Error saving record");
    } finally {
      setSaving(false);
    }
  };

  const isFilled = observedTime !== "" && estimatedTime !== "" && personsEstimate !== "" && numTasks !== "" && availableHoursPerPerson !== "";

  return (
    <div className="p-8 w-full mx-auto">
      <div className="mb-4">
        <BackLink href="/models">Back to Models</BackLink>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Model 26B — Factored Estimating (Method 2)</h1>
          <p className="text-body mb-6 max-w-2xl">
            Estimate required staff numbers using observed and estimated time metrics with corrective factors.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/staff-number"
            className="bg-white border border-line shadow-sm text-body px-4 py-2 rounded-md hover:bg-canvas font-medium text-sm transition-colors"
          >
            ← Method 1
          </Link>
          <Link
            href="/models/staff-number/method3"
            className="bg-white border border-line shadow-sm text-body px-4 py-2 rounded-md hover:bg-canvas font-medium text-sm transition-colors"
          >
            Method 3 ➜
          </Link>
          <Link
            href="/models/staff-number/history"
            className="bg-white border border-line shadow-sm text-body px-4 py-2 rounded-md hover:bg-canvas font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Category 1: Time Estimations */}
        <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
            <div className="w-8 h-8 rounded-full bg-pes-50 flex items-center justify-center text-pes-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-strong">Time Estimations</h2>
              <p className="text-xs text-muted">Observed and reported time metrics</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                <span className="truncate">Observed Time</span>
                <InfoPopover text="Time actually recorded during observation." />
              </div>
              <input
                type="number"
                value={observedTime}
                onChange={(e) => setObservedTime(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-pes-400 focus:shadow-focus outline-none transition-shadow"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                <span className="truncate">Estimated Time</span>
                <InfoPopover text="Theoretical estimated time for the process." />
              </div>
              <input
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-pes-400 focus:shadow-focus outline-none transition-shadow"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                <span className="truncate">Person's Estimate</span>
                <InfoPopover text="The estimate provided by the personnel performing the task." />
              </div>
              <input
                type="number"
                value={personsEstimate}
                onChange={(e) => setPersonsEstimate(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-pes-400 focus:shadow-focus outline-none transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Category 2: Modifiers & Load */}
        <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-strong">Modifiers & Load</h2>
              <p className="text-xs text-muted">Factors and volumes affecting the estimate</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                <span className="truncate">Corrective Factor</span>
                <InfoPopover text="Adjustment factor applied to correct the person's estimate." />
              </div>
              <input
                type="number"
                value={correctiveFactor}
                onChange={(e) => setCorrectiveFactor(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-pes-400 focus:shadow-focus outline-none transition-shadow"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                <span className="truncate">Number of Tasks</span>
                <InfoPopover text="Total volume of tasks to be completed." />
              </div>
              <input
                type="number"
                value={numTasks}
                onChange={(e) => setNumTasks(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-pes-400 focus:shadow-focus outline-none transition-shadow"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                <span className="truncate">Relaxation Allowance (%)</span>
                <InfoPopover text="Percentage of additional time allowed for breaks/fatigue." />
              </div>
              <input
                type="number"
                value={relaxAllowance}
                onChange={(e) => setRelaxAllowance(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-pes-400 focus:shadow-focus outline-none transition-shadow"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                <span className="truncate">Available Man-hours per Person/Year</span>
                <InfoPopover text="Total workable hours available from a single employee in a year." />
              </div>
              <input
                type="number"
                value={availableHoursPerPerson}
                onChange={(e) => setAvailableHoursPerPerson(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-pes-400 focus:shadow-focus outline-none transition-shadow"
              />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-danger-600 font-medium mb-4">{error}</p>}

      <button
        onClick={calculate}
        disabled={!isFilled}
        className={`px-6 py-2 rounded text-white ${isFilled ? "bg-pes hover:bg-pes-800" : "bg-gray-400 cursor-not-allowed"}`}
      >
        Calculate Staff Estimate
      </button>

      {result !== null && (
        <div className="mt-8 border-t border-line pt-8">
          <h2 className="text-xl font-bold text-strong mb-6">Model Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-line p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted mb-1">Estimated Staff Needed</p>
                <p className="text-4xl font-bold text-pes">{result} personnel</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-pes-50 flex items-center justify-center text-pes-600">
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
