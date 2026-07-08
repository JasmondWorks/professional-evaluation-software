"use client";

import Link from "next/link";
import { ArrowLeft2, Calculator, Save2, Star } from "iconsax-react";
import { useState } from "react";
import InfoPopover from "@/app/components/ui/InfoPopover";

export default function NonAcademicAppraisalPage() {
  const [metrics, setMetrics] = useState({
    output: 0,
    quality: 0,
    efficiency: 0,
    attendance: 0,
    teamwork: 0,
  });

  const [weights, setWeights] = useState({
    output: 0.3,
    quality: 0.25,
    efficiency: 0.2,
    attendance: 0.15,
    teamwork: 0.1,
  });

  const [thresholds, setThresholds] = useState({
    excellent: 80,
    good: 65,
    average: 50,
  });

  const [result, setResult] = useState<{
    score: number;
    rating: string;
    color: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const calculateScore = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validate weights sum to 1.0
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      setErrorMsg("Weights must sum up to exactly 1.0");
      setLoading(false);
      return;
    }

    const total =
      metrics.output * weights.output +
      metrics.quality * weights.quality +
      metrics.efficiency * weights.efficiency +
      metrics.attendance * weights.attendance +
      metrics.teamwork * weights.teamwork;

    let rating = "";
    let color = "";

    if (total >= thresholds.excellent) {
      rating = "Excellent";
      color = "bg-green-50 border-green-200 text-green-700";
    } else if (total >= thresholds.good) {
      rating = "Good";
      color = "bg-blue-50 border-blue-200 text-blue-700";
    } else if (total >= thresholds.average) {
      rating = "Average";
      color = "bg-yellow-50 border-yellow-200 text-yellow-700";
    } else {
      rating = "Needs Improvement";
      color = "bg-red-50 border-red-200 text-red-700";
    }

    setResult({ score: total, rating, color });

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/nonAcademicAppraisal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          metrics,
          weights,
          thresholds,
          totalScore: total,
          rating,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSuccessMsg("Appraisal saved successfully!");
    } catch (err: any) {
      console.error("Error saving appraisal:", err);
      setErrorMsg(err.message || "Error saving appraisal.");
    } finally {
      setLoading(false);
    }
  };

  const renderMetricInput = (
    label: string,
    value: number,
    field: keyof typeof metrics,
    description: string
  ) => (
    <div className="block">
      <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
        <span className="truncate">{label}</span>
        <InfoPopover text={description} />
      </div>
      <input
        type="number"
        value={value}
        min="0"
        max="100"
        onChange={(e) => setMetrics({ ...metrics, [field]: Number(e.target.value) })}
        className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
      />
    </div>
  );

  const renderWeightInput = (
    label: string,
    value: number,
    field: keyof typeof weights,
  ) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type="number"
        step="0.05"
        min="0"
        max="1"
        value={value}
        onChange={(e) => setWeights({ ...weights, [field]: Number(e.target.value) })}
        className="w-24 rounded border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-pes"
      />
    </div>
  );

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
          <h1 className="text-2xl font-bold mb-2">Non-Academic Staff Appraisal</h1>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Evaluate non-academic staff based on output, quality, efficiency, attendance, and teamwork.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/non-academic-appraisal/history"
            className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            View History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Star size="16" variant="Bold" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Performance Metrics</h2>
                <p className="text-xs text-gray-500">Score each category from 0 to 100</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderMetricInput("Output Quantity", metrics.output, "output", "Amount of work produced within a given timeframe.")}
              {renderMetricInput("Quality of Work", metrics.quality, "quality", "Accuracy, thoroughness, and standard of work produced.")}
              {renderMetricInput("Efficiency", metrics.efficiency, "efficiency", "Speed and resourcefulness in completing tasks.")}
              {renderMetricInput("Attendance", metrics.attendance, "attendance", "Punctuality and reliability of presence.")}
              {renderMetricInput("Teamwork", metrics.teamwork, "teamwork", "Ability to collaborate and communicate effectively with others.")}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Calculator size="16" variant="Bold" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Metric Weights</h2>
                <p className="text-xs text-gray-500">Must sum to 1.0 exactly</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderWeightInput("Output Weight", weights.output, "output")}
              {renderWeightInput("Quality Weight", weights.quality, "quality")}
              {renderWeightInput("Efficiency Weight", weights.efficiency, "efficiency")}
              {renderWeightInput("Attendance Weight", weights.attendance, "attendance")}
              {renderWeightInput("Teamwork Weight", weights.teamwork, "teamwork")}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Rating Thresholds</h2>
            <p className="text-xs text-gray-500 mb-6">Define the minimum score for each rating tier</p>
            
            <div className="space-y-4">
              <div className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-1.5">Excellent (≥)</span>
                <input
                  type="number"
                  value={thresholds.excellent}
                  onChange={(e) => setThresholds({ ...thresholds, excellent: Number(e.target.value) })}
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes outline-none"
                />
              </div>
              <div className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-1.5">Good (≥)</span>
                <input
                  type="number"
                  value={thresholds.good}
                  onChange={(e) => setThresholds({ ...thresholds, good: Number(e.target.value) })}
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes outline-none"
                />
              </div>
              <div className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-1.5">Average (≥)</span>
                <input
                  type="number"
                  value={thresholds.average}
                  onChange={(e) => setThresholds({ ...thresholds, average: Number(e.target.value) })}
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Calculate & Save</h2>
            
            {errorMsg && <p className="text-red-600 font-medium text-sm mb-4">{errorMsg}</p>}
            {successMsg && <p className="text-green-600 font-medium text-sm mb-4">{successMsg}</p>}

            <button
              onClick={calculateScore}
              disabled={loading}
              className="w-full py-3 bg-pes text-white rounded-lg hover:bg-blue-900 transition-colors font-medium shadow-sm flex justify-center items-center gap-2"
            >
              {loading ? "Saving..." : (
                <>
                  <Save2 size="18" />
                  Evaluate Staff
                </>
              )}
            </button>

            {result && (
              <div className={`mt-6 p-4 rounded-lg border text-center ${result.color}`}>
                <p className="text-sm font-medium mb-1">Total Score</p>
                <p className="text-3xl font-bold mb-1">{result.score.toFixed(2)}</p>
                <p className="text-sm font-semibold">{result.rating}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
