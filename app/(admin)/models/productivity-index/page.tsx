"use client";
import React, { useState, useEffect } from "react";

export default function ProductivityIndex() {
  const [data, setData] = useState({
    output: "",
    input: "",
  });

  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userToken, setUserToken] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) setUserToken(token);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const evaluateProductivity = () => {
    const { output, input } = data;
    if (!output || !input || Number(input) === 0) {
      alert("Please enter valid input and output values.");
      return;
    }

    const index = Number(output) / Number(input);
    setResult(Number(index.toFixed(3)));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;

    setLoading(true);

    try {
      const res = await fetch("/api/addPersonnelIndex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          payload: "productivity",
          productivity: result,
        }),
      });

      if (!res.ok) throw new Error("Failed to save productivity index");

      setSuccess(true);
      setData({ output: "", input: "" });
      setResult(null);
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong while saving data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="font-bold text-3xl my-6">Productivity Index</h1>

      <form
        className="bg-white shadow-md rounded-xl p-6 w-full max-w-2xl"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <label className="flex flex-col">
            <span className="mb-2 font-semibold">
              Output Resources (uninflated)
            </span>
            <input
              name="output"
              type="number"
              required
              onChange={handleChange}
              value={data.output}
              className="border rounded px-3 py-2 focus:outline-pes"
            />
          </label>

          <label className="flex flex-col">
            <span className="mb-2 font-semibold">
              Input Resources (uninflated)
            </span>
            <input
              name="input"
              type="number"
              required
              onChange={handleChange}
              value={data.input}
              className="border rounded px-3 py-2 focus:outline-pes"
            />
          </label>
        </div>

        {result !== null && (
          <p className="my-2 text-lg">
            Productivity Index:{" "}
            <span className="font-bold text-blue-600">{result}</span>
          </p>
        )}

        {success && (
          <p className="text-green-600 mt-2 font-semibold">
            ✅ Successfully saved.
          </p>
        )}

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={evaluateProductivity}
            className="bg-pes hover:bg-pes/90 text-white font-semibold py-2 px-6 rounded"
          >
            Evaluate
          </button>

          <button
            type="submit"
            disabled={!result || loading}
            className={`${
              result
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            } text-white font-semibold py-2 px-6 rounded`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
