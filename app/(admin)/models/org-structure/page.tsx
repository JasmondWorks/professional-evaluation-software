"use client";

import Link from "next/link";
import { Save2, Calculator, Chart2, BoxAdd, BoxRemove, DocumentText } from 'iconsax-react';
import { useEffect, useState } from "react";
import InfoPopover from "@/app/components/ui/InfoPopover";
import CascadePanel from "./CascadePanel";
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import { BackLink } from '@/app/components/ui';

export default function OrgStructurePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error" | "">("");

  // This model is derived from the optimal span of control K*, so it stays
  // locked until Personnel Utilisation has been run for the org. The same
  // check is enforced in /api/orgStructure — this one only saves the user
  // from filling six sections of a form that cannot be saved.
  const [utilizationRun, setUtilizationRun] = useState<boolean | null>(null);
  // Section 17 quotes the optimal supervisory span. It used to link to a
  // reference PDF that was never in the repo, so the button 404'd; the org's
  // own most recent K* is both accurate and already fetched by the gate check.
  const [latestKstar, setLatestKstar] = useState<number | null>(null);

  const token = typeof window !== "undefined" ? getAccessToken() : null;

  useEffect(() => {
    let cancelled = false;

    async function checkPrerequisite() {
      if (!token) {
        setUtilizationRun(false);
        return;
      }
      try {
        const res = await apiFetch("/api/getPersonnelUtilization", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!cancelled) {
          const runs = Array.isArray(data?.data) ? data.data : [];
          setUtilizationRun(res.ok && runs.length > 0);
          const kstar = runs[0]?.kstar;
          setLatestKstar(kstar == null ? null : Number(kstar));
        }
      } catch {
        if (!cancelled) setUtilizationRun(false);
      }
    }

    checkPrerequisite();
    return () => {
      cancelled = true;
    };
  }, [token]);

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
      const res = await apiFetch("/api/orgStructure", {
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

  // Sections 18, 19 and 21 are computed together in ./CascadePanel now. They
  // used to be three separate cards of Σ-terms whose results could contradict
  // one another, because nothing tied the ladder in 18 to the shape in 19 or
  // the comparison in 21.

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

  // Section 22 (future requirements) moved out to its own model at
  // /models/future-requirements, where it reads a and b off a line fitted
  // through the recorded history instead of asking somebody to derive them by
  // hand and type them in.

  // ===== Helpers =====
  const numberInput = (
    label: string,
    value: number | "",
    setValue: (v: number | "") => void,
    desc?: string
  ) => (
    <div className="block">
      <div className="flex items-center text-sm font-semibold text-body mb-1.5">
        <span className="truncate">{label}</span>
        {desc && <InfoPopover text={desc} />}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
        className="mt-1.5 block w-full rounded-md border border-line bg-canvas focus:bg-white px-3 py-2 text-sm focus:border-pes outline-none transition-all"
      />
    </div>
  );

  const dynamicList = (
    label: string,
    list: number[],
    setList: (v: number[]) => void,
  ) => (
    <div className="mb-4">
      <div className="text-sm font-semibold text-body mb-1.5">{label}</div>
      <div className="space-y-2 border border-line bg-canvas p-3 rounded-lg">
        {list.map((val, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <span className="text-xs font-bold text-muted w-4">{idx + 1}.</span>
            <input
              type="number"
              value={val}
              onChange={(e) => {
                const newList = [...list];
                newList[idx] = Number(e.target.value);
                setList(newList);
              }}
              className="block w-full rounded border-line px-3 py-1.5 text-sm shadow-sm outline-none focus:border-pes"
            />
            {list.length > 1 && (
              <button
                onClick={() => {
                  const newList = list.filter((_, i) => i !== idx);
                  setList(newList);
                }}
                type="button"
                className="text-danger-600 hover:text-danger-700 p-1"
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
          className="flex items-center gap-1 text-xs font-medium text-pes hover:text-pes-800 transition-colors mt-2 ml-6"
        >
          <BoxAdd size="16" /> Add Row
        </button>
      </div>
    </div>
  );

  const modelCard = (title: string, desc: string, icon: React.ReactNode, children: React.ReactNode, onCalc?: () => void, result?: number | null, resultLabel?: string, resultUnit: string = "") => (
    <div className="bg-white rounded-xl border border-line overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
          <div className="w-8 h-8 rounded-full bg-pes-50 flex items-center justify-center text-pes-600">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-strong">{title}</h2>
            <p className="text-xs text-muted">{desc}</p>
          </div>
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
      {onCalc && (
        <div className="p-6 bg-canvas border-t border-line">
          <button
            onClick={onCalc}
            disabled={loading}
            className="w-full py-2.5 bg-pes text-white rounded-lg hover:bg-pes-800 transition-colors font-medium shadow-sm flex justify-center items-center gap-2"
          >
            {loading ? "Saving..." : (
              <>
                <Calculator size="18" />
                Calculate & Save
              </>
            )}
          </button>

          {result !== null && result !== undefined && (
            <div className="mt-4 p-4 rounded-lg border text-center bg-pes-50 border-blue-100 text-blue-900">
              <p className="text-xs font-medium mb-1 text-pes-700">{resultLabel || "Result"}</p>
              <p className="text-2xl font-bold">{result.toFixed(2)}{resultUnit}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (utilizationRun === null) {
    return (
      <div className="p-8 w-full mx-auto">
        <div className="mb-4">
          <BackLink href="/models">Back to Models</BackLink>
        </div>
        <p className="text-muted text-sm">Checking prerequisites…</p>
      </div>
    );
  }

  if (!utilizationRun) {
    return (
      <div className="p-8 w-full mx-auto">
        <div className="mb-4">
          <BackLink href="/models">Back to Models</BackLink>
        </div>

        <div className="bg-white rounded-xl border border-line p-8 shadow-sm max-w-2xl">
          <h1 className="text-2xl font-bold mb-2">Organization Structure</h1>
          <p className="text-body mb-6">
            This model is derived from the optimal span of control (K*) produced
            by the Personnel Utilisation model. Run Personnel Utilisation for
            your organisation first, then return here.
          </p>
          <Link
            href="/models/personnel-utilization"
            className="inline-block bg-pes text-white rounded px-6 py-2 hover:opacity-90"
          >
            Go to Personnel Utilisation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full mx-auto">
      <div className="mb-4">
        <BackLink href="/models">Back to Models</BackLink>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Organization Structure (Models 17–22)</h1>
          <p className="text-body max-w-2xl text-sm">
            Determine personnel utilization, structural sizing, shape, design min/max boundaries, redundancy percentage, and projected personnel requirements.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/org-structure/history"
            className="bg-white border border-line shadow-sm text-body px-4 py-2 rounded-md hover:bg-canvas font-medium text-sm transition-colors flex items-center gap-2"
          >
            <DocumentText size="16" />
            View History
          </Link>
        </div>
      </div>

      {message && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border text-sm font-medium animate-in slide-in-from-bottom-5 z-50 ${
          msgType === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-danger-50 text-danger-700 border-danger-100"
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Sections 17-19 and 21 are one calculation, not four: 17's head count
            is what 18 divides down level by level, 18's ladder is 19's shape,
            and 21 measures that ladder against the real organization. */}
        <div className="xl:col-span-3">
          <CascadePanel onSave={saveResult} />
        </div>

      </div>
    </div>
  );
}
