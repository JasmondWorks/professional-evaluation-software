"use client";

import { useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import { ArrowLeft2, Save2, Calculator, Money4, DocumentText, Warning2 } from "iconsax-react";
import InfoPopover from "@/app/components/ui/InfoPopover";
import { apiFetch } from '@/app/utils/apiFetch';

type SharedConstants = {
  Cwh: number | "";
  Cbh: number | "";
  Hd: number | "";
};

export default function StaffAppraisalAllPage() {
  const [shared, setShared] = useState<SharedConstants>({
    Cwh: "",
    Cbh: "",
    Hd: "",
  });

  const [OQ, setOQ] = useState<number | "">("");
  const [WQ, setWQ] = useState<number | "">("");
  const [points, setPoints] = useState<number | "">("");
  const [RTP, setRTP] = useState<number | "">("");
  const [staffAppraisalResult, setStaffAppraisalResult] = useState<null | any>(null);

  const [Na, setNa] = useState<number | "">("");
  const [Ta, setTa] = useState<number | "">("");
  const [unitOverloadingResult, setUnitOverloadingResult] = useState<null | any>(null);

  const [Pidle, setPidle] = useState<number | "">("");
  const [bossLostResult, setBossLostResult] = useState<null | any>(null);

  const [totalWastedCost, setTotalWastedCost] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const calculateAll = () => {
    // 1. Staff Appraisal
    const computedAppraisalMaxScore = Number(OQ) * Number(WQ);
    const hodMaxScore = computedAppraisalMaxScore + Number(points);
    setStaffAppraisalResult({
      computedAppraisalMaxScore,
      hodMaxScore,
      RTP: Number(RTP),
    });

    // 2. Unit Head Overloading
    const wastedManHours = Number(Na) * Number(Ta);
    const wastedCost = wastedManHours * Number(shared.Cwh);
    setUnitOverloadingResult({ wastedManHours, wastedCost });

    // 3. Boss Lost Hours
    const Lh = Number(Pidle) * Number(shared.Hd);
    const cost = Lh * Number(shared.Cbh);
    setBossLostResult({ Lh, cost });

    // 4. Total Wasted Cost
    setTotalWastedCost(wastedCost + cost);
  };

  const handleSave = async () => {
    if (totalWastedCost === null) return;
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const token = getAccessToken();
    if (!token) {
      setErrorMsg("Missing authentication token");
      setLoading(false);
      return;
    }

    const payload = {
      shared,
      OQ,
      WQ,
      points,
      RTP,
      staffAppraisalResult,
      Na,
      Ta,
      unitOverloadingResult,
      Pidle,
      bossLostResult,
      totalWastedCost,
    };

    try {
      const res = await apiFetch("/api/staffAppraisal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) setSuccessMsg("Results saved successfully!");
      else setErrorMsg(`Failed to save: ${data.error}`);
    } catch (err: any) {
      setErrorMsg("Network error saving results");
    } finally {
      setLoading(false);
    }
  };

  const numberInput = (
    label: string,
    value: number | "",
    setValue: (v: number | "") => void,
    desc: string,
    opts: { min?: number; step?: number } = {},
  ) => (
    <div className="block">
      <div className="flex items-center text-sm font-semibold text-body mb-1.5">
        <span className="truncate">{label}</span>
        <InfoPopover text={desc} />
      </div>
      <input
        type="number"
        min={opts.min}
        step={opts.step}
        value={value}
        onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
        className="mt-1.5 block w-full rounded-md border border-line bg-canvas focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
      />
    </div>
  );

  return (
    <div className="p-8 w-full mx-auto max-w-7xl">
      <div className="mb-4">
        <Link
          href="/models"
          className="inline-flex items-center text-sm text-muted hover:text-pes transition-colors"
        >
          <ArrowLeft2 size="16" className="mr-1" /> Back to Models
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Staff Appraisal & Costs</h1>
          <p className="text-body mb-6 max-w-2xl">
            Evaluate staff performance, compute lost hours due to underloading and overloading, and estimate total financial impact of wasted man-hours.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/appraisal/history"
            className="bg-white border border-line shadow-sm text-body px-4 py-2 rounded-md hover:bg-canvas font-medium text-sm transition-colors flex items-center gap-2"
          >
            <DocumentText size="16" />
            View History
          </Link>
        </div>
      </div>

      {/* Shared Constants */}
      <div className="bg-white rounded-xl border border-line p-6 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
          <div className="w-8 h-8 rounded-full bg-pes-50 flex items-center justify-center text-pes-600">
            <Money4 size="16" variant="Bold" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-strong">Shared Constants</h2>
            <p className="text-xs text-muted">Hourly costs and daily working limits</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {numberInput("Cost per wasted hour (Cwh)", shared.Cwh, (v) => setShared({ ...shared, Cwh: v }), "Staff level cost per wasted hour", { min: 0, step: 0.01 })}
          {numberInput("Cost per wasted hour (Cbh)", shared.Cbh, (v) => setShared({ ...shared, Cbh: v }), "Boss level cost per wasted hour", { min: 0, step: 0.01 })}
          {numberInput("Daily working hours (Hd)", shared.Hd, (v) => setShared({ ...shared, Hd: v }), "Standard daily working hours", { min: 0, step: 0.1 })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Column */}
        <div className="space-y-8">
          
          <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <DocumentText size="16" variant="Bold" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-strong">Staff Appraisal Metrics</h2>
                <p className="text-xs text-muted">Output and quality scores</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {numberInput("Output Quantity (OQ)", OQ, setOQ, "Overall output quantity score")}
              {numberInput("Worth of Quality (WQ)", WQ, setWQ, "Worth of quality score")}
              {numberInput("HOD Points", points, setPoints, "Additional points assigned")}
              {numberInput("RTP Target", RTP, setRTP, "Relative to Target Performance")}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <Warning2 size="16" variant="Bold" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-strong">Unit Head Overloading</h2>
                <p className="text-xs text-muted">Cost of wait times for subordinates</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {numberInput("Avg. waiting subordinates (Na)", Na, setNa, "Average number of subordinates or cases waiting daily")}
              {numberInput("Avg. waiting time (Ta)", Ta, setTa, "Average time in hours a case waits for attention")}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
              <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                <Warning2 size="16" variant="Bold" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-strong">Boss Underloading</h2>
                <p className="text-xs text-muted">Lost man-hours due to idle time</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {numberInput("Idle Proportion (Pidle)", Pidle, setPidle, "Proportion of time idle per day (0-1)", { min: 0, step: 0.01 })}
            </div>
          </div>

        </div>

        {/* Right Column (Results) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-line p-6 shadow-sm sticky top-8">
            <h2 className="text-lg font-bold text-strong mb-6">Simulation Results</h2>

            <button
              onClick={calculateAll}
              className="w-full py-3 bg-pes text-white rounded-lg hover:bg-pes-800 transition-colors font-medium shadow-sm flex justify-center items-center gap-2 mb-6"
            >
              <Calculator size="18" />
              Run All Calculations
            </button>

            {totalWastedCost !== null && (
              <div className="space-y-4">
                
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <h3 className="text-sm font-semibold text-pes-700 mb-2">Appraisal Result</h3>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-indigo-700">Appraisal Max Score:</span>
                    <span className="font-bold">{staffAppraisalResult?.computedAppraisalMaxScore.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-indigo-700">HOD Max Score:</span>
                    <span className="font-bold">{staffAppraisalResult?.hodMaxScore.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-700">RTP:</span>
                    <span className="font-bold">{staffAppraisalResult?.RTP.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                  <h3 className="text-sm font-semibold text-red-900 mb-2">Unit Overloading</h3>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-700">Wasted Hours:</span>
                    <span className="font-bold">{unitOverloadingResult?.wastedManHours.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-700">Wasted Cost:</span>
                    <span className="font-bold">{unitOverloadingResult?.wastedCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-2">Boss Underloading</h3>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-yellow-700">Lost Hours (Lh):</span>
                    <span className="font-bold">{bossLostResult?.Lh.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-700">Lost Cost:</span>
                    <span className="font-bold">{bossLostResult?.cost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-line">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted mb-1">Total Wasted Man-Hour Cost</p>
                    <p className="text-4xl font-bold text-strong mb-4">{totalWastedCost.toFixed(2)}</p>
                  </div>
                </div>

                {errorMsg && <p className="text-red-600 text-sm font-medium text-center">{errorMsg}</p>}
                {successMsg && <p className="text-green-600 text-sm font-medium text-center">{successMsg}</p>}

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm flex justify-center items-center gap-2"
                >
                  {loading ? "Saving..." : (
                    <>
                      <Save2 size="18" />
                      Save Results to Database
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
