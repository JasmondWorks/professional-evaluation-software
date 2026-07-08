"use client";
import React, { useState, useEffect } from "react";
import { getAccessToken } from '@/app/utils/auth';
import Link from "next/link";
import { ArrowLeft2 } from "iconsax-react";
import InfoPopover from "@/app/components/ui/InfoPopover";

interface StaffMix {
  lecturers: number;
  seniorLecturers: number;
  professors: number;
}

interface Params {
  D: number;
  G: number;
  Y: number;
  alpha: number;
  t1: number;
  t2: number;
  t3: number;
  t4: number;
  S0: number;
  studentPopulation: number;
  staffMix: StaffMix;
}

export default function StudentTeacherRatio() {
  const [params, setParams] = useState<Params>({
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

  const [mus, setMus] = useState({
    mu0: 6,
    mu1: 15.75,
    mu2: 12.75,
    mu3: 3.75,
    mu4: 0,
  });

  const [lambdas, setLambdas] = useState({
    lambda0: 5,
    lambda1: 2.25,
    lambda2: 3.0,
    lambda3: 2.75,
    lambda4: 0.75,
  });

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [calcErrorMsg, setCalcErrorMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  const handleParamChange = (field: keyof Params, val: number) => {
    setParams((prev) => ({ ...prev, [field]: val }));
  };

  const handleStaffMixChange = (field: keyof StaffMix, val: number) => {
    setParams((prev) => ({
      ...prev,
      staffMix: { ...prev.staffMix, [field]: val },
    }));
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    return n <= 1 ? 1 : n * factorial(n - 1);
  };

  const combination = (n: number, k: number) => {
    if (k < 0 || n < 0 || k > n) return NaN;
    return factorial(n) / (factorial(k) * factorial(n - k));
  };

  const calculateP0 = (k: number, rho: number) => {
    let sum = 1;
    for (let n = 2; n <= k; n++) {
      sum += combination(n, k) * factorial(n) * Math.pow(rho, n);
    }
    return 1 / sum;
  };

  const calculateW = (k: number, rho: number, mu: number, P0: number) => {
    let sum = 0;
    for (let n = 2; n <= k; n++) {
      sum += (n - 1) * combination(n, k) * factorial(n) * Math.pow(rho, n) * P0;
    }
    return (1 / mu) + (sum / (mu * (1 - P0)));
  };

  const calculateH = (K: number, mu: number, lambda: number) => {
    const { D, G, Y, alpha, t1, t2, t3, t4, S0 } = params;

    const F = D - (Y * alpha);
    const B = t1 * F;
    const rho = lambda / mu;

    if (rho >= 1) return { H_ordinary: 0, H_robust: 0 };

    const P0 = calculateP0(K, rho);
    const W = calculateW(K, lambda, mu, P0);

    const term1 = K * (B - W);
    const term2 = B * (1 - P0);
    const term3 = t4 * K;
    const term4 = ((1 - S0) * G) - D;

    const denom1 = (K + 1) * (D - Y * alpha) * t1;
    const denom2 = (1 - t1 - t2) * (D - Y * alpha);
    const denom3 = G - D;

    const H_robust = (term1 + term2 + term3 + term4) / (denom1 + denom2 + denom3);
    return { H_robust };
  };

  const findOptimalK_robust = (mu: number, lambda: number) => {
    let maxH = 0;
    let optimalK = 0;
    for (let K = 1; K <= 50; K++) {
      const { H_robust } = calculateH(K, mu, lambda);
      if (H_robust > maxH) {
        maxH = H_robust;
        optimalK = K;
      }
    }
    return { optimalK, maxH };
  };

  const calculateStaffNeeds = (optimalK: number, optimalK1: number, optimalK2: number, optimalK3: number, optimalK4: number) => {
    const { studentPopulation, staffMix } = params;
    const totalStaffNeeded = Math.ceil(studentPopulation / optimalK);
    const staffDistribution = {
      lecturers: Math.round(totalStaffNeeded * staffMix.lecturers),
      seniorLecturers: Math.round(totalStaffNeeded * staffMix.seniorLecturers),
      professors: Math.round(totalStaffNeeded * staffMix.professors),
    };
    const supervisoryStaff = optimalK1 ? Math.ceil(totalStaffNeeded / optimalK1) : 0;
    const managementStaffLevel1 = optimalK2 ? Math.ceil(supervisoryStaff / optimalK2) : 0;
    const managementStaffLevel2 = optimalK3 ? Math.ceil(managementStaffLevel1 / optimalK3) : 0;
    const topManagementStaff = optimalK4 ? Math.ceil(managementStaffLevel2 / optimalK4) : 0;

    return { totalStaffNeeded, supervisoryStaff, managementStaffLevel1, managementStaffLevel2, topManagementStaff, staffDistribution };
  };

  const handleCalculate = () => {
    setCalcErrorMsg(null);
    setSaveErrorMsg(null);
    setSuccessMsg(null);
    
    // Validate staff mix
    const mixTotal = params.staffMix.lecturers + params.staffMix.seniorLecturers + params.staffMix.professors;
    if (Math.abs(mixTotal - 1.0) > 0.01) {
      setCalcErrorMsg("Staff mix proportions must add up to 1.0");
      return;
    }

    const Ks = [];
    type MuKeys = 'mu0' | 'mu1' | 'mu2' | 'mu3' | 'mu4';
    type LambdaKeys = 'lambda0' | 'lambda1' | 'lambda2' | 'lambda3' | 'lambda4';

    for (let i = 0; i < 5; i++) {
      Ks.push(findOptimalK_robust(mus[`mu${i}` as MuKeys], lambdas[`lambda${i}` as LambdaKeys]));
    }

    const { optimalK, maxH } = Ks[0] || { optimalK: 1, maxH: 0 }; // prevent divide by zero
    const optimalK1 = Ks[1]?.optimalK ?? 0;
    const optimalK2 = Ks[2]?.optimalK ?? 0;
    const optimalK3 = Ks[3]?.optimalK ?? 0;
    const optimalK4 = Ks[4]?.optimalK ?? 0;

    if (optimalK === 0) {
      setCalcErrorMsg("Calculated Optimal K is zero. Adjust your inputs.");
      return;
    }

    const needs = calculateStaffNeeds(optimalK, optimalK1, optimalK2, optimalK3, optimalK4);

    setResults({
      optimalK,
      efficiencyValue: maxH,
      ...needs
    });
  };

  const handleSave = async () => {
    if (!results) return;
    setLoading(true);
    setSuccessMsg(null);
    setSaveErrorMsg(null);

    try {
      const payload = {
        optimalK: results.optimalK,
        totalStaffNeeded: results.totalStaffNeeded,
        supervisoryStaff: results.supervisoryStaff,
        managementLevel1: results.managementStaffLevel1,
        managementLevel2: results.managementStaffLevel2,
        topManagement: results.topManagementStaff,
        lecturers: results.staffDistribution.lecturers,
        seniorLecturers: results.staffDistribution.seniorLecturers,
        professors: results.staffDistribution.professors,
        efficiencyValue: results.efficiencyValue
      };

      const res = await fetch("/api/studentTeacherRatio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save data");

      setSuccessMsg("✅ Successfully saved to database");
    } catch (err: any) {
      console.error(err);
      setSaveErrorMsg("Error saving data to the database");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold mb-2">Student-Teacher Ratio Model</h1>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Calculates the optimal student-teacher ratio (K) and estimates total academic and management staff required based on queuing theory and workload analysis.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/student-teacher/history"
            className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            View History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* General Parameters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Workload Parameters</h2>
              <p className="text-xs text-gray-500">Core metrics determining lecturer availability</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="block">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Total Weekly Work Hrs (D)</span>
                <InfoPopover text="Total official hours available for formal activities per week (e.g. 40)." />
              </div>
              <input
                type="number"
                value={params.D}
                onChange={(e) => handleParamChange("D", Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Total Weekly Hrs (G)</span>
                <InfoPopover text="Total hours available in a week (24 * 7 = 168)." />
              </div>
              <input
                type="number"
                value={params.G}
                onChange={(e) => handleParamChange("G", Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Lecture Hrs/Course (Y)</span>
                <InfoPopover text="Weekly lecture hours per single course." />
              </div>
              <input
                type="number"
                value={params.Y}
                onChange={(e) => handleParamChange("Y", Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Courses Lectured (α)</span>
                <InfoPopover text="Number of courses to be lectured per week by one lecturer." />
              </div>
              <input
                type="number"
                value={params.alpha}
                onChange={(e) => handleParamChange("alpha", Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Proportions & Mix */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Distribution & Rates</h2>
              <p className="text-xs text-gray-500">Student populations and time allocations</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="block">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Student Population</span>
                <InfoPopover text="Total number of students in the department/faculty." />
              </div>
              <input
                type="number"
                value={params.studentPopulation}
                onChange={(e) => handleParamChange("studentPopulation", Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
            <div className="block">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                <span className="truncate">Consultation Prop (t1)</span>
                <InfoPopover text="Proportion of non-lecture time allocated to student consultation." />
              </div>
              <input
                type="number"
                step="0.1"
                value={params.t1}
                onChange={(e) => handleParamChange("t1", Number(e.target.value))}
                className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="block">
              <div className="text-xs font-semibold text-gray-700 mb-1.5 truncate">Lecturers Mix</div>
              <input
                type="number"
                step="0.1"
                value={params.staffMix.lecturers}
                onChange={(e) => handleStaffMixChange("lecturers", Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm outline-none transition-all"
              />
            </div>
            <div className="block">
              <div className="text-xs font-semibold text-gray-700 mb-1.5 truncate">Senior Lecturers Mix</div>
              <input
                type="number"
                step="0.1"
                value={params.staffMix.seniorLecturers}
                onChange={(e) => handleStaffMixChange("seniorLecturers", Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm outline-none transition-all"
              />
            </div>
            <div className="block">
              <div className="text-xs font-semibold text-gray-700 mb-1.5 truncate">Professors Mix</div>
              <input
                type="number"
                step="0.1"
                value={params.staffMix.professors}
                onChange={(e) => handleStaffMixChange("professors", Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm outline-none transition-all"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">These three mix values must sum to 1.0</p>
        </div>
      </div>

      {calcErrorMsg && <p className="text-red-600 font-medium mb-4">{calcErrorMsg}</p>}

      <button
        onClick={handleCalculate}
        className="px-6 py-2 bg-pes text-white rounded hover:bg-blue-900 transition-colors font-medium shadow-sm"
      >
        Calculate Student-Teacher Ratio
      </button>

      {results && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Simulation Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-indigo-50 rounded-xl p-6 shadow-sm border border-indigo-100 flex flex-col justify-center">
              <p className="text-sm font-medium text-indigo-800 mb-1">Optimal K (Ratio)</p>
              <p className="text-4xl font-bold text-indigo-900">{results.optimalK}</p>
              <p className="text-xs text-indigo-600 mt-2">Students per teacher</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Academic Staff</p>
              <p className="text-3xl font-bold text-gray-900">{results.totalStaffNeeded}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500 mb-1">Supervisory Staff</p>
              <p className="text-3xl font-bold text-gray-900">{results.supervisoryStaff}</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500 mb-1">Efficiency Value</p>
              <p className="text-2xl font-bold text-gray-900">{results.efficiencyValue.toFixed(4)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Academic Staff Breakdown</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Lecturers:</span>
                  <span className="font-medium bg-gray-100 px-3 py-1 rounded-full">{results.staffDistribution.lecturers}</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Senior Lecturers:</span>
                  <span className="font-medium bg-gray-100 px-3 py-1 rounded-full">{results.staffDistribution.seniorLecturers}</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Professors:</span>
                  <span className="font-medium bg-gray-100 px-3 py-1 rounded-full">{results.staffDistribution.professors}</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Management Breakdown</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Level 1 Management:</span>
                  <span className="font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{results.managementStaffLevel1}</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Level 2 Management:</span>
                  <span className="font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{results.managementStaffLevel2}</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Top Management:</span>
                  <span className="font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{results.topManagementStaff}</span>
                </li>
              </ul>
            </div>
          </div>

          {saveErrorMsg && <p className="text-red-600 font-medium mb-2">{saveErrorMsg}</p>}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-pes text-white rounded px-6 py-2 hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Result"}
            </button>
            {successMsg && <span className="text-sm font-medium text-green-600">{successMsg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}