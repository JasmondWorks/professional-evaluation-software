"use client";

import { useState } from "react";
import { saveResult } from "../util/sharedPost";

export default function Method2Page() {
  const [observedTime, setObservedTime] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [correctiveFactor, setCorrectiveFactor] = useState<number>(0);
  const [personsEstimate, setPersonsEstimate] = useState<number>(0);
  const [numTasks, setNumTasks] = useState<number>(0);
  const [relaxAllowance, setRelaxAllowance] = useState<number>(0);
  const [availableHoursPerPerson, setAvailableHoursPerPerson] = useState<number>(0);

  const [result, setResult] = useState<number | null>(null);

  const calculate = async () => {
    // Corrected estimate
    const correctedEstimate = personsEstimate * (1 + correctiveFactor);
    // Basic time (average of observed and estimated times, as placeholder logic)
    const basicTime = ((observedTime + estimatedTime) / 2) * correctedEstimate;
    // Standard man-hours of a task
    const standardManHoursPerTask = basicTime * (1 + relaxAllowance / 100);
    // Total standard man-hours
    const totalStandardManHours = standardManHoursPerTask * numTasks;
    // Staff needed
    const staffNeeded = totalStandardManHours / availableHoursPerPerson;

    setResult(staffNeeded);
    
    await saveResult({
      methodType: "Method2",
      staffNeeded,
      observedTime,
      estimatedTime,
      correctiveFactor,
      personsEstimate,
      numTasks,
      relaxAllowance,
      availableHoursPerPerson
    });
  };

  return (
    <div className="w-full p-12">
      <div className="border rounded p-4 space-y-4">
        <h1 className="font-semibold text-lg">Method 2: Factored Estimating</h1>

        {/* Placeholder PDF Links */}
        {/* <a
          href="https://example.com/relaxation-allowance-table.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-pes text-white rounded hover:opacity-90"
        >
          View Relaxation Allowance Guide
        </a> */}

        {/* Inputs */}
        <label className="block">
          Observed Time
          <input
            type="number"
            value={observedTime}
            onChange={(e) => setObservedTime(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        <label className="block">
          Estimated Time
          <input
            type="number"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        <label className="block">
          Corrective Factor
          <input
            type="number"
            value={correctiveFactor}
            onChange={(e) => setCorrectiveFactor(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </label>

        <label className="block">
          Person's Estimate
          <input
            type="number"
            value={personsEstimate}
            onChange={(e) => setPersonsEstimate(Number(e.target.value))}
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
          Relaxation Allowance (%)
          <input
            type="number"
            value={relaxAllowance}
            onChange={(e) => setRelaxAllowance(Number(e.target.value))}
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
