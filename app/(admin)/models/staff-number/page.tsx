"use client";

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { saveResult } from "./util/sharedPost"

export default function Method1Page() {
  const [basicTime, setBasicTime] = useState<number>(0);
  const [relaxAllowance, setRelaxAllowance] = useState<number>(0);
  const [loadFactor, setLoadFactor] = useState<number>(0);
  const [numTasks, setNumTasks] = useState<number>(0);
  const [timePerTask, setTimePerTask] = useState<number>(0);
  const [availableHoursPerPerson, setAvailableHoursPerPerson] = useState<number>(0);

  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);

    // Validation
    if (availableHoursPerPerson <= 0) {
      setError("⚠️ Available Man-hours per Person must be greater than zero.");
      return;
    }
    if (basicTime <= 0 || numTasks <= 0 || timePerTask <= 0) {
      setError("⚠️ All time and task inputs must be greater than zero.");
      return;
    }

    // Formula: Number of Staff = (Total Standard Man-hours) / (Available Man-hours per Person)
    const standardManHoursPerTask = basicTime * (1 + relaxAllowance / 100) * loadFactor;
    const totalStandardManHours = standardManHoursPerTask * numTasks * timePerTask;
    const staffNeeded = Math.round(totalStandardManHours / availableHoursPerPerson);
    setResult(staffNeeded);

    try {
      await saveResult({
        methodType: "Method1",
        staffNeeded,
        basicTime,
        relaxAllowance,
        loadFactor,
        numTasks,
        timePerTask,
        availableHoursPerPerson
      })
    } catch (err) {
      console.error("Failed to save result:", err);
    }
  };

  return (
    <div className="w-full p-12">
      <div className="border rounded p-4 space-y-4">
        <h1 className="font-semibold text-lg">Method 1: Plain Estimating</h1>

        {/* Placeholder PDF Links */}
        <div className="w-1/2 flex my-2">
          <a
            href="/downloadables/relax.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 m-4 bg-pes text-white rounded hover:opacity-90"
          >
            View Relaxation Allowance Guide
          </a>
          <a
            href="/downloadables/load-classification-table.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 m-4 bg-pes text-white rounded hover:opacity-90"
          >
            View Load Classification Table
          </a>
        </div>


        {/* Inputs */}
        <label className="block">
          Basic Time
          <input
            type="number"
            value={basicTime}
            onChange={(e) => setBasicTime(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        <label className="block">
          Relaxation Allowance (%)
          <input
            type="number"
            value={relaxAllowance}
            onChange={(e) => setRelaxAllowance(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        <label className="block">
          Load Classification Factor
          <input
            type="number"
            value={loadFactor}
            onChange={(e) => setLoadFactor(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        <label className="block">
          Number of Tasks
          <input
            type="number"
            value={numTasks}
            onChange={(e) => setNumTasks(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        <label className="block">
          Time per Task (hours)
          <input
            type="number"
            value={timePerTask}
            onChange={(e) => setTimePerTask(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        <label className="block">
          Available Man-hours per Person per Year
          <input
            type="number"
            value={availableHoursPerPerson}
            onChange={(e) => setAvailableHoursPerPerson(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        {/* Calculate Button */}
        <div className="flex flex-col gap-2 print:hidden">
          {isAdmin ? (
            <button
              onClick={calculate}
              className="px-4 py-2 bg-pes text-white rounded hover:opacity-90 w-fit"
            >
              Calculate Staff Needed
            </button>
          ) : (
            <p className="text-red-600 font-semibold text-sm">Only admins can perform calculations.</p>
          )}
          {error && <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>}
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
