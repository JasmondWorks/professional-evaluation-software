"use client";

import { useEffect, useState } from "react";

export default function AchievementCriteriaPage() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const [criteria, setCriteria] = useState<
    { name: string; weight: number; scores: number[]; open: boolean }[]
  >([]);

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

  // 🧩 Fetch user performance data from backend
  useEffect(() => {
    async function fetchPerformance() {
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch("/api/getPerformance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        console.log("Fetched performance data:", data);

        // build criteria with weights and scores + open state
        const loaded = [
          { name: "Competence", weight: 0.25, scores: data.competence || [], open: false },
          { name: "Integrity", weight: 0.25, scores: data.integrity || [], open: false },
          { name: "Compatibility", weight: 0.25, scores: data.compatibility || [], open: false },
          { name: "Use of Resources", weight: 0.25, scores: data.useOfResources || [], open: false },
        ];

        setCriteria(loaded);
      } catch (err) {
        console.error("Error fetching performance:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPerformance();
  }, []);

  const toggleCriterion = (index: number) => {
    setCriteria((prev) =>
      prev.map((c, i) => (i === index ? { ...c, open: !c.open } : c))
    );
  };

  const calculateScore = () => {
    let total = 0;
    criteria.forEach((criterion) => {
      const subtotal =
        criterion.scores.length > 0
          ? criterion.scores.reduce((a, b) => a + b, 0) / criterion.scores.length
          : 0;
      total += subtotal * criterion.weight;
    });

    let rating = "";
    let color = "";

    if (total >= thresholds.excellent) {
      rating = "Excellent";
      color = "bg-green-500 text-white";
    } else if (total >= thresholds.good) {
      rating = "Good";
      color = "bg-blue-500 text-white";
    } else if (total >= thresholds.average) {
      rating = "Average";
      color = "bg-yellow-400 text-black";
    } else {
      rating = "Needs Improvement";
      color = "bg-red-500 text-white";
    }

    setResult({ score: total, rating, color });
  };

  if (loading)
    return <div className="p-6 text-gray-500">Loading performance data...</div>;

  return (
    <div className="w-full p-12">
      <div className="border rounded">
        <button
          onClick={() => setOpen(!open)}
          className="w-full text-left px-4 py-3 bg-gray-100 font-semibold"
        >
          24. Achievement Criteria Performance Measurement
        </button>

        {open && (
          <div className="p-4 space-y-6">
            {/* PDF link */}
            <div>
              <a
                href="/downloadables/performance_table.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-pes text-white rounded hover:opacity-90"
                download={'example.pdf'}
              >
                View Achievement Criteria Measurement Table
              </a>
            </div>

            {/* Collapsible Criterion Sections */}
            {criteria.map((criterion, index) => {
              const subtotal =
                criterion.scores.length > 0
                  ? criterion.scores.reduce((a, b) => a + b, 0) / criterion.scores.length
                  : 0;
              const weighted = subtotal * criterion.weight;

              return (
                <div key={index} className="border rounded">
                  {/* Header Button */}
                  <button
                    onClick={() => toggleCriterion(index)}
                    className="w-full text-left px-4 py-2 bg-gray-50 border-b font-medium flex justify-between items-center"
                  >
                    <span>
                      {criterion.name} (Weight: {criterion.weight})
                    </span>
                    <span className="text-gray-500">
                      {criterion.open ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* Content */}
                  {criterion.open && (
                    <div className="p-4 space-y-3">
                      <div className="space-y-2">
                        {criterion.scores.map((s, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>Score {i + 1}</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 text-sm text-gray-700 border-t mt-2">
                        Subtotal (avg): {subtotal.toFixed(2)} <br />
                        Weighted ({criterion.weight * 100}%): {weighted.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Threshold Inputs */}
            <div>
              <h3 className="font-semibold mb-2">Rating Thresholds</h3>
              {Object.keys(thresholds).map((key) => (
                <label key={key} className="block mb-3">
                  <span className="block text-sm font-medium mb-1 capitalize">
                    {key} ≥
                  </span>
                  <input
                    type="number"
                    value={(thresholds as any)[key]}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, [key]: Number(e.target.value) })
                    }
                    className="w-full border rounded p-2"
                  />
                </label>
              ))}
            </div>

            {/* Calculate Button */}
            <div>
              <button
                onClick={calculateScore}
                className="px-4 py-2 bg-pes text-white rounded hover:opacity-90"
              >
                Calculate Overall Performance
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className={`p-4 rounded mt-4 font-semibold ${result.color}`}>
                Total Score: {result.score.toFixed(2)} — {result.rating}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
