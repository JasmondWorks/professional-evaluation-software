"use client";

import React from "react";

interface Results {
  optimalK: number;
  efficiencyValue: number;
  totalStaffNeeded: number;
  supervisoryStaff: number;
  managementStaffLevel1: number;
  managementStaffLevel2: number;
  topManagementStaff: number;
  staffDistribution: {
    lecturers: number;
    seniorLecturers: number;
    professors: number;
  };
}

export default function ResultsCard({ results }: { results: Results }) {
  if (!results) return null;

  return (
    <div className="bg-white border rounded-2xl shadow-md p-6 mt-8 w-full md:w-3/4 lg:w-1/2 mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Optimization Results
      </h2>

      <div className="grid grid-cols-2 gap-y-2 text-gray-700">
        <p className="font-semibold">Optimal K*:</p>
        <p>{results.optimalK}</p>

        <p className="font-semibold">Efficiency Value:</p>
        <p>{results.efficiencyValue.toFixed(4)}</p>

        <p className="font-semibold">Total Staff Needed:</p>
        <p>{results.totalStaffNeeded}</p>

        <p className="font-semibold">Supervisory Staff:</p>
        <p>{results.supervisoryStaff}</p>

        <p className="font-semibold">Management Level 1:</p>
        <p>{results.managementStaffLevel1}</p>

        <p className="font-semibold">Management Level 2:</p>
        <p>{results.managementStaffLevel2}</p>

        <p className="font-semibold">Top Management Staff:</p>
        <p>{results.topManagementStaff}</p>
      </div>

      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          Staff Distribution
        </h3>
        <div className="grid grid-cols-2 gap-y-2 text-gray-700">
          <p className="font-semibold">Lecturers:</p>
          <p>{results.staffDistribution.lecturers}</p>

          <p className="font-semibold">Senior Lecturers:</p>
          <p>{results.staffDistribution.seniorLecturers}</p>

          <p className="font-semibold">Professors:</p>
          <p>{results.staffDistribution.professors}</p>
        </div>
      </div>
    </div>
  );
}
