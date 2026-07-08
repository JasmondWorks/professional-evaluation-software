"use client";

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { getAccessToken } from "@/app/utils/auth";
import {
  findOptimalK_ordinary,
  calculateStaffNeeds,
} from "../utils/sharedLogic";
import ParametersForm from "../_components/ParametersForm";
import ResultsCard from "../_components/ResultsCard";

export default function OrdinaryOptimization() {
  const [params, setParams] = useState({
    D: 40,
    G: 168,
    Y: 3,
    alpha: 4,
    t1: 0.4,
    t2: 0.4,
    t3: 0.2,
    t4: 0.5,
    studentPopulation: 1000,
    staffMix: {
      lecturers: 0.5,
      seniorLecturers: 0.3,
      professors: 0.2,
    },
  });

  const mus = [6, 15.75, 12.75, 3.75, 0];
  const lambdas = [5, 2.25, 3, 2.75, 0.75];

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const decoded: any = jwt.decode(token);
      setRole(decoded?.role || null);
    }
  }, []);

  const isAdmin = role === "super-admin" || role === "admin";

  const handleCalculate = async () => {
    setLoading(true);
    setStatus(null);

    // 🔹 Compute optimization results
    const Ks = mus.map((mu, i) =>
      findOptimalK_ordinary(mu, lambdas[i], params)
    );

    const optimalKs = Ks.map((x) => x.optimalK);
    const { totalStaffNeeded, supervisoryStaff, managementStaffLevel1, managementStaffLevel2, topManagementStaff, staffDistribution } =
      calculateStaffNeeds(
        optimalKs,
        params.studentPopulation,
        params.staffMix
      );

    const calculated = {
      optimalK: optimalKs[0],
      efficiencyValue: Ks[0].maxH,
      totalStaffNeeded,
      supervisoryStaff,
      managementStaffLevel1,
      managementStaffLevel2,
      topManagementStaff,
      staffDistribution,
    };

    setResults(calculated);

    // 🔹 Save result to backend
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({
          mode: "ordinary",
          ...params,
          ...calculated,
        }),
      });

      if (!res.ok) throw new Error("Failed to save result");

      setStatus("✅ Result saved to database.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to save result. Check server logs.");
    }

    setLoading(false);
  };

  return (
    <div className="p-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/models/student-teacher" className="text-blue-600 hover:underline">
            {"<- back"}
          </Link>
          <h1 className="text-2xl font-bold">Ordinary Optimization</h1>
        </div>
        <Link
          href="/models/student-teacher/ordinary/history"
          className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2 print:hidden"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          View History
        </Link>
      </div>

      <div className="print:hidden">
        <ParametersForm params={params} setParams={setParams} mode="ordinary" />
      </div>

      <div className="print:hidden">
        {isAdmin ? (
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mt-4"
          >
            {loading ? "Calculating..." : "Calculate"}
          </button>
        ) : (
          <p className="mt-4 text-red-600 font-semibold text-sm">Only admins can perform calculations.</p>
        )}
      </div>

      {status && (
        <p
          className={`mt-3 text-sm ${
            status.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {status}
        </p>
      )}

      {results && (
        <div className="mt-6">
          <ResultsCard results={results} />
          {isAdmin && (
            <button 
              onClick={() => window.print()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 print:hidden"
            >
              Print Results
            </button>
          )}
        </div>
      )}
    </div>
  );
}


