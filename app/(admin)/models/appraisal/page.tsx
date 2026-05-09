"use client";

import { useState } from "react";

type SharedConstants = {
  Cwh: number | "";
  Cbh: number | "";
  Hd: number | "";
};

export default function StaffAppraisalAllPage() {
  // Shared constants
  const [shared, setShared] = useState<SharedConstants>({
    Cwh: "",
    Cbh: "",
    Hd: "",
  });

  // Collapsible state
  const [openSection, setOpenSection] = useState<string | null>(null);

  // ===== 1. Staff Appraisal =====
  const [OQ, setOQ] = useState<number | "">("");
  const [WQ, setWQ] = useState<number | "">("");
  const [points, setPoints] = useState<number | "">("");
  const [RTP, setRTP] = useState<number | "">("");
  const [staffAppraisalResult, setStaffAppraisalResult] = useState<null | any>(
    null
  );

  const calcStaffAppraisal = () => {
    // Placeholder logic until lookup tables are added
    const computedAppraisalMaxScore = Number(OQ) * Number(WQ);
    const hodMaxScore = computedAppraisalMaxScore + Number(points);
    setStaffAppraisalResult({
      computedAppraisalMaxScore,
      hodMaxScore,
      RTP: Number(RTP),
    });
  };

  // ===== 2. Unit Head Overloading =====
  const [Na, setNa] = useState<number | "">("");
  const [Ta, setTa] = useState<number | "">("");
  const [unitOverloadingResult, setUnitOverloadingResult] = useState<null | any>(
    null
  );

  const calcUnitOverloading = () => {
    const wastedManHours = Number(Na) * Number(Ta);
    const wastedCost = wastedManHours * Number(shared.Cwh);
    setUnitOverloadingResult({ wastedManHours, wastedCost });
  };

  // ===== 3. Boss Valuable Lost Man-Hours =====
  const [Pidle, setPidle] = useState<number | "">("");
  const [bossLostResult, setBossLostResult] = useState<null | any>(null);

  const calcBossLostHours = () => {
    const Lh = Number(Pidle) * Number(shared.Hd);
    const cost = Lh * Number(shared.Cbh);
    setBossLostResult({ Lh, cost });
  };

  // ===== 4. Total Wasted Man-Hour Cost =====
  const [totalWastedCost, setTotalWastedCost] = useState<number | null>(null);

  const calcTotalWastedCost = () => {
    const overCost = unitOverloadingResult?.wastedCost || 0;
    const bossCost = bossLostResult?.cost || 0;
    setTotalWastedCost(overCost + bossCost);
  };

  // ===== Helpers =====
  const numberInput = (
    label: string,
    value: number | "",
    setValue: (v: number | "") => void,
    opts: { min?: number; step?: number } = {}
  ) => (
    <label className="block mb-2">
      <div className="text-sm font-medium">{label}</div>
      <input
        type="number"
        min={opts.min}
        step={opts.step}
        value={value}
        onChange={(e) =>
          setValue(e.target.value === "" ? "" : Number(e.target.value))
        }
        className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm"
      />
    </label>
  );

  const section = (
    key: string,
    title: string,
    children: React.ReactNode
  ) => (
    <div className="border rounded mb-4">
      <button
        onClick={() => setOpenSection(openSection === key ? null : key)}
        className="w-full text-left p-3 bg-gray-100 font-semibold"
      >
        {title}
      </button>
      {openSection === key && <div className="p-4">{children}</div>}
    </div>
  );

  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Staff Appraisal & Related Models
      </h1>

      {/* ===== Shared Constants ===== */}
      {section(
        "shared",
        "Shared Constants",
        <>
          {numberInput(
            "Cwh — Cost per wasted man-hour (staff level)",
            shared.Cwh,
            (v) => setShared({ ...shared, Cwh: v }),
            { min: 0, step: 0.01 }
          )}
          {numberInput(
            "Cbh — Cost per wasted man-hour (boss level)",
            shared.Cbh,
            (v) => setShared({ ...shared, Cbh: v }),
            { min: 0, step: 0.01 }
          )}
          {numberInput(
            "Hd — Daily working hours",
            shared.Hd,
            (v) => setShared({ ...shared, Hd: v }),
            { min: 0, step: 0.1 }
          )}
        </>
      )}

      {/* ===== Staff Appraisal ===== */}
      {section(
        "staffAppraisal",
        "Staff Appraisal",
        <>
          <div className="flex gap-2 mb-4">
            <a
              href="https://example.com/staff-utilization.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              View Staff Utilization Table
            </a>
            <a
              href="https://example.com/academic-staff-utilization.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              View Academic Staff Utilization Table
            </a>
          </div>

          {numberInput("Overall output quantity (OQ)", OQ, setOQ)}
          {numberInput("Worth of quality (WQ)", WQ, setWQ)}
          {numberInput("Points", points, setPoints)}
          {numberInput("RTP (Relative to Target Performance)", RTP, setRTP)}
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={calcStaffAppraisal}
          >
            Calculate
          </button>

          {staffAppraisalResult && (
            <div className="mt-4 bg-white p-4 rounded shadow">
              <p>
                <strong>Computed Appraisal Max Score:</strong>{" "}
                {staffAppraisalResult.computedAppraisalMaxScore.toFixed(2)}
              </p>
              <p>
                <strong>HOD/Unit Max Score:</strong>{" "}
                {staffAppraisalResult.hodMaxScore.toFixed(2)}
              </p>
              <p>
                <strong>RTP:</strong> {staffAppraisalResult.RTP}
              </p>
            </div>
          )}
        </>
      )}

      {/* ===== Unit Head Overloading ===== */}
      {section(
        "unitOverloading",
        "Unit Head Overloading",
        <>
          {numberInput(
            "Na — Avg. number of subordinates/cases waiting daily",
            Na,
            setNa
          )}
          {numberInput(
            "Ta — Avg. time (hours) case waits for attention",
            Ta,
            setTa
          )}
          <p className="text-sm text-gray-500 mb-2">
            Cwh from Shared Constants will be used in calculation.
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={calcUnitOverloading}
          >
            Calculate
          </button>
          {unitOverloadingResult && (
            <div className="mt-4 bg-white p-4 rounded shadow">
              <p>
                <strong>Wasted Man-Hours:</strong>{" "}
                {unitOverloadingResult.wastedManHours.toFixed(2)}
              </p>
              <p>
                <strong>Wasted Cost:</strong>{" "}
                {unitOverloadingResult.wastedCost.toFixed(2)}
              </p>
            </div>
          )}
        </>
      )}

      {/* ===== Boss Valuable Lost Man-Hours ===== */}
      {section(
        "bossLost",
        "Boss Valuable Lost Man-Hours (Underloading)",
        <>
          {numberInput(
            "Pidle — Proportion of time idle/day (0-1)",
            Pidle,
            setPidle,
            { min: 0, step: 0.01 }
          )}
          <p className="text-sm text-gray-500 mb-2">
            Hd and Cbh from Shared Constants will be used in calculation.
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={calcBossLostHours}
          >
            Calculate
          </button>
          {bossLostResult && (
            <div className="mt-4 bg-white p-4 rounded shadow">
              <p>
                <strong>Lost Man-Hours/Day (Lh):</strong>{" "}
                {bossLostResult.Lh.toFixed(2)}
              </p>
              <p>
                <strong>Cost of Lost Man-Hours:</strong>{" "}
                {bossLostResult.cost.toFixed(2)}
              </p>
            </div>
          )}
        </>
      )}

      {/* ===== Total Wasted Man-Hour Cost ===== */}
      {<section className="border rounded mb-4">
          <h1 className="w-full text-left p-3 bg-gray-100 font-semibold">Total Wasted Man-Hour Cost</h1>

          <div className="p-4">
            <p className="text-sm text-gray-500 mb-2">
                Uses results from Unit Head Overloading and Boss Lost Man-Hours.
            </p>
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={calcTotalWastedCost}
            >
                Calculate
            </button>
            {totalWastedCost !== null && (
                <div className="mt-4 bg-white p-4 rounded shadow">
                <p>
                    <strong>Total Wasted Man-Hour Cost:</strong>{" "}
                    {totalWastedCost.toFixed(2)}
                </p>
                <button
                    className="mt-6 px-4 py-2 bg-green-600 text-white rounded"
                    onClick={async () => {
                      const token = localStorage.getItem("access_token");
                      if (!token) {
                        alert("Missing token");
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

                      const res = await fetch("/api/staffAppraisal", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                      });

                      const data = await res.json();
                      if (res.ok) alert("✅ Saved successfully!");
                      else alert(`❌ Failed to save: ${data.error}`);
                    }}
                  >
                    Save All Results
                  </button>
                </div>
            )}            
          </div>

      </section>
      }
    </div>
  );
}
