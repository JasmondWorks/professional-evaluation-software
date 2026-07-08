"use client";

import Link from "next/link";
import { ArrowLeft2, Save2, Calculator, Chart2, BoxAdd, BoxRemove, DocumentText } from "iconsax-react";
import { useState } from "react";
import InfoPopover from "@/app/components/ui/InfoPopover";

export default function OrgStructurePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error" | "">("");

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  async function saveResult(
    section: number,
    result: number,
    numerator: number[] = [],
    denominator: number[] = [],
    extra_data: any = {},
  ) {
    if (!token) {
      setMsgType("error");
      setMessage("Missing authentication token.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/orgStructure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          section,
          result,
          numerator,
          denominator,
          extra_data,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsgType("success");
        setMessage(`Results for Section ${section} saved successfully`);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMsgType("error");
        setMessage(`Error: ${data.error || "Failed to save"}`);
      }
    } catch (err: any) {
      setMsgType("error");
      setMessage(`Network error saving result`);
    } finally {
      setLoading(false);
    }
  }

  // ===== Section 18 =====
  const [section18Numerator, setSection18Numerator] = useState<number[]>([0]);
  const [section18DenominatorA, setSection18DenominatorA] = useState<number[]>([0]);
  const [section18DenominatorB, setSection18DenominatorB] = useState<number[]>([0]);
  const [section18Result, setSection18Result] = useState<number | null>(null);

  const calcSection18 = async () => {
    const sumNum = section18Numerator.reduce((a, b) => a + b, 0);
    const sumDenA = section18DenominatorA.reduce((a, b) => a + b, 0);
    const sumDenB = section18DenominatorB.reduce((a, b) => a + b, 0);
    const result = sumDenA && sumDenB ? sumNum / (sumDenA * sumDenB) : 0;
    setSection18Result(result);
    await saveResult(18, result, section18Numerator, [
      ...section18DenominatorA,
      ...section18DenominatorB,
    ]);
  };

  // ===== Section 19 =====
  const [section19Numerator, setSection19Numerator] = useState<number[]>([0]);
  const [section19Denominator, setSection19Denominator] = useState<number[]>([0]);
  const [Z, setZ] = useState<number | "">("");
  const [section19Result, setSection19Result] = useState<number | null>(null);

  const calcSection19 = async () => {
    const sumNum = section19Numerator.reduce((a, b) => a + b, 0);
    const sumDen = section19Denominator.reduce((a, b) => a + b, 0);
    const result = sumDen ? (Number(Z) * sumNum) / sumDen : 0;
    setSection19Result(result);
    await saveResult(19, result, section19Numerator, section19Denominator, { Z });
  };

  // ===== Section 20 =====
  const [maxInput, setMaxInput] = useState<number | "">("");
  const [minInput, setMinInput] = useState<number | "">("");
  const [maxResult, setMaxResult] = useState<number | null>(null);
  const [minResult, setMinResult] = useState<number | null>(null);

  const calcMax = async () => {
    const result = Number(maxInput);
    setMaxResult(result);
    await saveResult(20, result, [Number(maxInput)], [], { type: "Max" });
  };
  const calcMin = async () => {
    const result = Number(minInput);
    setMinResult(result);
    await saveResult(20, result, [Number(minInput)], [], { type: "Min" });
  };

  // ===== Section 21 =====
  const [prNumerator, setPrNumerator] = useState<number | "">("");
  const [prDenominator, setPrDenominator] = useState<number | "">("");
  const [prResult, setPrResult] = useState<number | null>(null);

  const calcPR = async () => {
    const result = Number(prDenominator) !== 0 ? (Number(prNumerator) / Number(prDenominator)) * 100 : 0;
    setPrResult(result);
    await saveResult(21, result, [Number(prNumerator)], [Number(prDenominator)]);
  };

  // ===== Section 22 =====
  const [a, setA] = useState<number | "">("");
  const [b, setB] = useState<number | "">("");
  const [x, setX] = useState<number | "">("");
  const [projResult, setProjResult] = useState<number | null>(null);

  const calcProjection = async () => {
    const result = Number(a) + Number(b) * Number(x);
    setProjResult(result);
    await saveResult(22, result, [Number(a), Number(b), Number(x)]);
  };

  // ===== Helpers =====
  const numberInput = (
    label: string,
    value: number | "",
    setValue: (v: number | "") => void,
    desc?: string
  ) => (
    <div className="block">
      <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
        <span className="truncate">{label}</span>
        {desc && <InfoPopover text={desc} />}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
        className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes outline-none transition-all"
      />
    </div>
  );

  const dynamicList = (
    label: string,
    list: number[],
    setList: (v: number[]) => void,
  ) => (
    <div className="mb-4">
      <div className="text-sm font-semibold text-gray-700 mb-1.5">{label}</div>
      <div className="space-y-2 border border-gray-100 bg-gray-50 p-3 rounded-lg">
        {list.map((val, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
            <input
              type="number"
              value={val}
              onChange={(e) => {
                const newList = [...list];
                newList[idx] = Number(e.target.value);
                setList(newList);
              }}
              className="block w-full rounded border-gray-300 px-3 py-1.5 text-sm shadow-sm outline-none focus:border-pes"
            />
            {list.length > 1 && (
              <button
                onClick={() => {
                  const newList = list.filter((_, i) => i !== idx);
                  setList(newList);
                }}
                type="button"
                className="text-red-400 hover:text-red-600 p-1"
                title="Remove row"
              >
                <BoxRemove size="18" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setList([...list, 0])}
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-pes hover:text-blue-800 transition-colors mt-2 ml-6"
        >
          <BoxAdd size="16" /> Add Row
        </button>
      </div>
    </div>
  );

  const modelCard = (title: string, desc: string, icon: React.ReactNode, children: React.ReactNode, onCalc?: () => void, result?: number | null, resultLabel?: string, resultUnit: string = "") => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
      {onCalc && (
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onCalc}
            disabled={loading}
            className="w-full py-2.5 bg-pes text-white rounded-lg hover:bg-blue-900 transition-colors font-medium shadow-sm flex justify-center items-center gap-2"
          >
            {loading ? "Saving..." : (
              <>
                <Calculator size="18" />
                Calculate & Save
              </>
            )}
          </button>

          {result !== null && result !== undefined && (
            <div className="mt-4 p-4 rounded-lg border text-center bg-blue-50 border-blue-100 text-blue-900">
              <p className="text-xs font-medium mb-1 text-blue-700">{resultLabel || "Result"}</p>
              <p className="text-2xl font-bold">{result.toFixed(2)}{resultUnit}</p>
            </div>
          )}
        </div>
      )}
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
          <h1 className="text-2xl font-bold mb-2">Organization Structure (Models 17–22)</h1>
          <p className="text-gray-600 max-w-2xl text-sm">
            Determine personnel utilization, structural sizing, shape, design min/max boundaries, redundancy percentage, and projected personnel requirements.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/org-structure/history"
            className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <DocumentText size="16" />
            View History
          </Link>
        </div>
      </div>

      {message && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border text-sm font-medium animate-in slide-in-from-bottom-5 z-50 ${
          msgType === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Model 17 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm xl:col-span-1 flex flex-col">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Chart2 size="16" variant="Bold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">17. Supervisory Size</h2>
              <p className="text-xs text-gray-500">Personnel Utilization Table</p>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-6">
              In a fair organization, optimal value at the supervisory level can be referenced directly from the standard Personnel Utilization Table.
            </p>
            <Link
              href="/downloadables/personnel-utilization.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm gap-2"
            >
              <DocumentText size="18" />
              View Reference Table
            </Link>
          </div>
        </div>

        {/* Model 18 */}
        <div className="xl:col-span-1">
          {modelCard(
            "18. Org. Structure Size",
            "Calculate structural size parameter (S)",
            <Chart2 size="16" variant="Bold" />,
            <>
              {dynamicList("Numerator terms (Σ...)", section18Numerator, setSection18Numerator)}
              {dynamicList("Denominator part A (Σ...)", section18DenominatorA, setSection18DenominatorA)}
              {dynamicList("Denominator part B (Σ...)", section18DenominatorB, setSection18DenominatorB)}
            </>,
            calcSection18,
            section18Result,
            "Result (S)"
          )}
        </div>

        {/* Model 19 */}
        <div className="xl:col-span-1">
          {modelCard(
            "19. Shape of Structure",
            "Calculate structural shape parameter (E)",
            <Chart2 size="16" variant="Bold" />,
            <>
              {numberInput("Z — Avg. management positions/level", Z, setZ)}
              <div className="mt-4">
                {dynamicList("Numerator terms (Σ...)", section19Numerator, setSection19Numerator)}
              </div>
              {dynamicList("Denominator terms (Σ...)", section19Denominator, setSection19Denominator)}
            </>,
            calcSection19,
            section19Result,
            "Shape (E)"
          )}
        </div>

        {/* Model 20 */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-full">
            <div className="p-6 flex-1">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Chart2 size="16" variant="Bold" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">20. Organizational Design</h2>
                  <p className="text-xs text-gray-500">Min and Max boundaries</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Maximum Limit</h3>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      {numberInput("Input for Max", maxInput, setMaxInput)}
                    </div>
                    <button onClick={calcMax} disabled={loading} className="px-4 py-2 bg-pes text-white rounded hover:bg-blue-900 text-sm font-medium">Save Max</button>
                  </div>
                  {maxResult !== null && <p className="text-xs font-bold text-pes mt-2">Saved Max: {maxResult}</p>}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Minimum Limit</h3>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      {numberInput("Input for Min", minInput, setMinInput)}
                    </div>
                    <button onClick={calcMin} disabled={loading} className="px-4 py-2 bg-pes text-white rounded hover:bg-blue-900 text-sm font-medium">Save Min</button>
                  </div>
                  {minResult !== null && <p className="text-xs font-bold text-pes mt-2">Saved Min: {minResult}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Model 21 */}
        <div className="xl:col-span-1">
          {modelCard(
            "21. Percentage Redundancy",
            "Calculate real PR%",
            <Chart2 size="16" variant="Bold" />,
            <>
              {numberInput("Numerator", prNumerator, setPrNumerator)}
              <div className="mt-4">
                {numberInput("Denominator", prDenominator, setPrDenominator)}
              </div>
            </>,
            calcPR,
            prResult,
            "PR%",
            "%"
          )}
        </div>

        {/* Model 22 */}
        <div className="xl:col-span-1">
          {modelCard(
            "22. Future Requirements",
            "Predict/project personnel requirements",
            <Chart2 size="16" variant="Bold" />,
            <>
              {numberInput("a — Intercept", a, setA)}
              <div className="my-4">
                {numberInput("b — Gradient", b, setB)}
              </div>
              {numberInput("x — Volume", x, setX, "Production/service volume")}
            </>,
            calcProjection,
            projResult,
            "Predicted Personnel"
          )}
        </div>

      </div>
    </div>
  );
}
