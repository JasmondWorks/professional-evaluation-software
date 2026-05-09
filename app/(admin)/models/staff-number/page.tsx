"use client";

import { useState } from "react";
import { saveResult} from "./util/sharedPost"

export default function Method1Page() {
  const [basicTime, setBasicTime] = useState<number>(0);
  const [relaxAllowance, setRelaxAllowance] = useState<number>(0);
  const [loadFactor, setLoadFactor] = useState<number>(0);
  const [numTasks, setNumTasks] = useState<number>(0);
  const [timePerTask, setTimePerTask] = useState<number>(0);
  const [availableHoursPerPerson, setAvailableHoursPerPerson] = useState<number>(0);

  const [result, setResult] = useState<number | null>(null);

  const calculate = async () => {
    // Formula: Number of Staff = (Total Standard Man-hours) / (Available Man-hours per Person)
    const standardManHoursPerTask = basicTime * (1 + relaxAllowance / 100) * loadFactor;
    const totalStandardManHours = standardManHoursPerTask * numTasks * timePerTask;
    const staffNeeded = totalStandardManHours / availableHoursPerPerson;
    setResult(staffNeeded);
    
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
  };

  return (
    <div className="w-full p-12">
      <div className="border rounded p-4 space-y-4">
        <h1 className="font-semibold text-lg">Method 1: Plain Estimating</h1>

        {/* Placeholder PDF Links */}
        <div className="w-1/2 flex my-2">
            <a
            href="https://example.com/relaxation-allowance-table.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 m-4 bg-pes text-white rounded hover:opacity-90"
            >
            View Relaxation Allowance Guide
            </a>
            <a
            href="https://example.com/load-classification-table.pdf"
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
        <button
          onClick={calculate}
          className="px-4 py-2 bg-pes text-white rounded hover:opacity-90"
        >
          Calculate Staff Needed
        </button>

        {/* Result */}
        {result !== null && (
          <div className="p-4 bg-gray-100 rounded font-semibold">
            Number of Staff Needed: {result.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
