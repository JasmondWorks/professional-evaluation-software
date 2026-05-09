'use client';
import React, { useState } from "react";

export default function UtilizationIndex() {
  const [data, setData] = useState({ used: 0, given: 0 });
  const [result, setResult] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "calculating" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const evaluate = () => {
    if (data.given <= 0) {
      setMessage("❌ Given hours must be greater than zero.");
      setStatus("error");
      return;
    }

    const value = data.used / data.given;
    setResult(value);
    setStatus("success");
    setMessage(`✅ Utilization index calculated: ${value.toFixed(2)}`);
  };

  const handleSubmit = async () => {
    if (result === null) {
      setMessage("⚠️ Please calculate utilization first.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    setMessage("Saving utilization index...");

    try {
      const res = await fetch("/api/addPersonnelIndex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          payload: "utility",
          utility: result,
        }),
      });

      if (!res.ok) throw new Error("Failed to save data.");

      setStatus("success");
      setMessage("✅ Utilization index saved successfully!");
      setData({ used: 0, given: 0 });
      setResult(null);
    } catch (err) {
      console.error("Error saving data:", err);
      setStatus("error");
      setMessage("❌ Error saving data. Please try again.");
    }
  };

  return (
    <div className="flex flex-col m-4">
      <h1 className="font-bold text-3xl my-6">Utilization Index</h1>

      <div className="flex flex-wrap gap-6 mb-6">
        <label className="flex flex-col w-72">
          <span>Used hours</span>
          <input
            onChange={handleChange}
            name="used"
            type="number"
            value={data.used}
            className="border px-4 py-2 rounded"
            placeholder="Enter used hours"
            min={0}
          />
        </label>

        <label className="flex flex-col w-72">
          <span>Given hours</span>
          <input
            onChange={handleChange}
            name="given"
            type="number"
            value={data.given}
            className="border px-4 py-2 rounded"
            placeholder="Enter given hours"
            min={0}
          />
        </label>
      </div>

      {message && (
        <p
          className={`text-sm mb-2 ${
            status === "error"
              ? "text-red-500"
              : status === "success"
              ? "text-green-600"
              : "text-gray-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="flex gap-4">
        <button
          onClick={evaluate}
          className="bg-pes text-white px-8 py-2 rounded hover:opacity-90"
        >
          Evaluate
        </button>
        <button
          onClick={handleSubmit}
          disabled={status === "saving" || result === null}
          className={`px-8 py-2 rounded text-white ${
            result === null
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-pes hover:opacity-90"
          }`}
        >
          {status === "saving" ? "Saving..." : "Save"}
        </button>
      </div>

      {result !== null && (
        <div className="mt-4">
          <p className="font-semibold">
            Utilization Index:{" "}
            <span className="text-blue-600">{result.toFixed(3)}</span>
          </p>
        </div>
      )}
    </div>
  );
}
