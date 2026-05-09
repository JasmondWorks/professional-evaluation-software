"use client";

import { useState } from "react";
import Link from "next/link";
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
    S0: 0.2,
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
        headers: { "Content-Type": "application/json" },
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
      <div className="flex items-center mb-6 space-x-4">
        <Link href="/models/student-teacher" className="text-blue-600 hover:underline">
          {"<- back"}
        </Link>
        <h1 className="text-2xl font-bold">Ordinary Optimization</h1>
      </div>

      <ParametersForm params={params} setParams={setParams} />

      <button
        onClick={handleCalculate}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mt-4"
      >
        {loading ? "Calculating..." : "Calculate"}
      </button>

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
        </div>
      )}
    </div>
  );
}


