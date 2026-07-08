"use client";

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { saveResult } from "./util/sharedPost";
import Link from "next/link";
import { ArrowLeft2 } from "iconsax-react";
import InfoPopover from "@/app/components/ui/InfoPopover";

export default function Method1Page() {
  const [basicTime, setBasicTime] = useState<number | "">("");
  const [relaxAllowance, setRelaxAllowance] = useState<number | "">("");
  const [loadFactor, setLoadFactor] = useState<number | "">("");
  const [numTasks, setNumTasks] = useState<number | "">("");
  const [timePerTask, setTimePerTask] = useState<number | "">("");
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
    if (!basicTime || !numTasks || !timePerTask || Number(basicTime) <= 0 || Number(numTasks) <= 0 || Number(timePerTask) <= 0) {
      setError("⚠️ All time and task inputs must be greater than zero.");
      return;
    }

    const basicTimeNum = Number(basicTime);
    const relaxNum = Number(relaxAllowance) || 0;
    const loadNum = Number(loadFactor) || 1;
    const numTasksNum = Number(numTasks);
    const timePerTaskNum = Number(timePerTask);
    const availableNum = Number(availableHoursPerPerson);

    const standardManHoursPerTask = basicTimeNum * (1 + relaxNum / 100) * loadNum;
    const totalStandardManHours = standardManHoursPerTask * numTasksNum * timePerTaskNum;
    const staffNeeded = Math.round(totalStandardManHours / availableNum);
    
    setResult(staffNeeded);
  };

  const saveToDb = async () => {
    if (result === null) return;
    try {
      setSaving(true);
      await saveResult({
        methodType: "Method1",
        staffNeeded: result,
        basicTime: Number(basicTime),
        relaxAllowance: Number(relaxAllowance),
        loadFactor: Number(loadFactor),
        numTasks: Number(numTasks),
        timePerTask: Number(timePerTask),
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

  const isFilled = basicTime !== "" && numTasks !== "" && timePerTask !== "" && availableHoursPerPerson !== "";

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
          <h1 className="text-2xl font-bold mb-2">Model 26A — Plain Estimating (Method 1)</h1>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Estimate the required staff numbers based on standard man-hours and task volumes.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/staff-number/method2"
            className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            Go to Method 2 ➜
          </Link>
          <Link
            href="/models/staff-number/history"
            className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            View History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Category 1: Time & Task Volume */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Task Volume & Time</h2>
              <p className="text-xs text-gray-500">Core parameters defining the workload</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Basic Time</span>
                <InfoPopover text="Base time taken to complete a single task (without allowances)." />
              </div>
              <input
                type="number"
                value={basicTime}
                onChange={(e) => setBasicTime(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Number of Tasks</span>
                <InfoPopover text="Total quantity of tasks to be processed." />
              </div>
              <input
                type="number"
                value={numTasks}
                onChange={(e) => setNumTasks(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Time per Task (hours)</span>
                <InfoPopover text="Time allocated for a specific task grouping." />
              </div>
              <input
                type="number"
                value={timePerTask}
                onChange={(e) => setTimePerTask(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category 2: Modifiers & Availability */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Modifiers & Availability</h2>
              <p className="text-xs text-gray-500">Factors adjusting the raw time estimate</p>
            </div>
          </div>
          <div className="flex gap-2 mb-6">
            <Link
              href="/downloadables/relax.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              📄 Relaxation Guide
            </Link>
            <Link
              href="/downloadables/load-classification-table.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              📄 Load Classification Table
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Relaxation Allowance (%)</span>
                <InfoPopover text="Percentage of additional time allowed for breaks/fatigue." />
              </div>
              <input
                type="number"
                value={relaxAllowance}
                onChange={(e) => setRelaxAllowance(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Load Classification Factor</span>
                <InfoPopover text="Factor applied to account for the physical/mental load." />
              </div>
              <input
                type="number"
                value={loadFactor}
                onChange={(e) => setLoadFactor(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block w-full min-w-0">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Available Man-hours per Person/Year</span>
                <InfoPopover text="Total workable hours available from a single employee in a year." />
              </div>
              <input
                type="number"
                value={availableHoursPerPerson}
                onChange={(e) => setAvailableHoursPerPerson(e.target.value === "" ? "" : Number(e.target.value))}
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
