"use client";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function UnitHeadOverloadingPage() {
  const [actualHours, setActualHours] = useState<number | "">("");
  const [numSubs, setNumSubs] = useState<number | "">("");
  const [extraComplexity, setExtraComplexity] = useState<number | "">("");
  const [optimalHours, setOptimalHours] = useState<number | "">("");
  const [optimalK, setOptimalK] = useState<number | "">("");
  const [result, setResult] = useState<null | {
    CF: number;
    OR: number;
    status: string;
  }>(null);
  const [saving, setSaving] = useState(false);

  // fetch K* and H* defaults
  useEffect(() => {
    const fetchUtilization = async () => {
      try {
        const res = await fetch("/api/personnelUtilization");
        if (!res.ok) throw new Error("Failed to fetch utilization data");
        const data = await res.json();
        if (data?.Kstar) setOptimalK(data.Kstar);
        if (data?.Hstar) setOptimalHours(data.Hstar);
      } catch (err) {
        console.error("Error fetching utilization data:", err);
      }
    };
    fetchUtilization();
  }, []);

  const calculate = () => {
    const CF = 1 + Number(extraComplexity) / Number(numSubs);
    const OR = (Number(actualHours) * CF) / Number(optimalHours);

    let status = "";
    if (OR > 1.05) status = "Overloaded";
    else if (OR < 0.95) status = "Underloaded";
    else status = "Optimal";

    setResult({ CF, OR, status });
  };

  const saveResult = async () => {
    if (!result) return alert("Please calculate before saving");

    try {
      setSaving(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("No access token found");
        return;
      }

      const decoded: any = jwtDecode(token);
      const org = decoded?.org;
      if (!org) {
        alert("Invalid token: missing org");
        return;
      }

      const res = await fetch("/api/unitHead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          org,
          actualHours,
          numSubs,
          extraComplexity,
          optimalHours,
          optimalK,
          CF: result.CF,
          OR: result.OR,
          status: result.status,
        }),
      });

      if (!res.ok) throw new Error("Failed to save record");
      alert("Record saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving record");
    } finally {
      setSaving(false);
    }
  };

  const isFilled =
    actualHours && numSubs && extraComplexity && optimalHours && optimalK;

  const numberInput = (
    label: string,
    value: number | "",
    setValue: (val: number | "") => void
  ) => (
    <label className="block">
      <div className="text-sm font-medium">{label}</div>
      <input
        type="number"
        value={value}
        onChange={(e) =>
          setValue(e.target.value === "" ? "" : Number(e.target.value))
        }
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
      />
    </label>
  );

  return (
    <div className="w-full p-8 mx-auto">
      <a href="/models/personnel-utilization" className="text-pes hover:underline">
        Back
      </a>

      <h1 className="text-2xl font-bold mb-4">
        Model 14 — Unit Head Overloading
      </h1>
      <p className="text-gray-600 mb-6">
        Calculates Overload Ratio (OR) using K* and H* values from personnel utilization.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {numberInput("Actual supervisory hours/week", actualHours, setActualHours)}
        {numberInput("Number of subordinates", numSubs, setNumSubs)}
        {numberInput("Total extra complexity weight", extraComplexity, setExtraComplexity)}
        {numberInput("Optimal supervisory hours (H*)", optimalHours, setOptimalHours)}
        {numberInput("Optimal K (K*)", optimalK, setOptimalK)}
      </div>

      <div className="flex gap-4">
        <button
          onClick={calculate}
          disabled={!isFilled}
          className={`px-4 py-2 rounded text-white ${
            isFilled
              ? "bg-pes hover:bg-blue-900"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Calculate
        </button>

        <button
          onClick={saveResult}
          disabled={!result || saving}
          className={`px-4 py-2 rounded text-white ${
            !result || saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {saving ? "Saving..." : "Save to Database"}
        </button>
      </div>

      {result && (
        <div className="bg-white p-4 rounded shadow mt-6">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <p>
            <strong>Complexity Factor (CF):</strong> {result.CF.toFixed(3)}
          </p>
          <p>
            <strong>Overload Ratio (OR):</strong> {result.OR.toFixed(3)}
          </p>
          <p
            className={`font-semibold ${
              result.status === "Optimal"
                ? "text-green-600"
                : result.status === "Overloaded"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            Status: {result.status}
          </p>
        </div>
      )}
    </div>
  );
}
