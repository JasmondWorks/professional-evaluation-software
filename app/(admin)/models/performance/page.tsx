"use client";

import Link from "next/link";
import { ArrowLeft2, Calculator, Save2, Star, DocumentText } from "iconsax-react";
import { useEffect, useState } from "react";
import InfoPopover from "@/app/components/ui/InfoPopover";
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';

export default function AchievementCriteriaPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [criteria, setCriteria] = useState<{ name: string; weight: number; scores: number[]; open: boolean }[]>([]);

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

  // Fetch user performance data from backend
  useEffect(() => {
    async function fetchPerformance() {
      const token = getAccessToken();

      try {
        const res = await apiFetch("/api/getPerformance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        const loaded = [
          { name: "Competence", weight: 0.25, scores: data.competence || [], open: true },
          { name: "Integrity", weight: 0.25, scores: data.integrity || [], open: true },
          { name: "Compatibility", weight: 0.25, scores: data.compatibility || [], open: true },
          { name: "Use of Resources", weight: 0.25, scores: data.useOfResources || [], open: true },
        ];

        setCriteria(loaded);
      } catch (err) {
        console.error("Error fetching performance:", err);
        setErrorMsg("Failed to load performance data from the database.");
      } finally {
        setLoading(false);
      }
    }
    fetchPerformance();
  }, []);

  const toggleCriterion = (index: number) => {
    setCriteria((prev) => prev.map((c, i) => (i === index ? { ...c, open: !c.open } : c)));
  };

  const updateWeight = (index: number, weight: number) => {
    setCriteria((prev) => prev.map((c, i) => (i === index ? { ...c, weight } : c)));
  };

  const calculateScore = async () => {
    setSuccessMsg("");
    setErrorMsg("");

    // Validate weights sum to 1.0
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      setErrorMsg("Weights must sum up to exactly 1.0");
      return;
    }

    let total = 0;
    criteria.forEach((criterion) => {
      const subtotal = criterion.scores.length > 0
        ? criterion.scores.reduce((a, b) => a + b, 0) / criterion.scores.length
        : 0;
      total += subtotal * criterion.weight;
    });

    let rating = "";
    let color = "";

    if (total >= thresholds.excellent) {
      rating = "Excellent";
      color = "bg-green-50 border-green-200 text-green-700";
    } else if (total >= thresholds.good) {
      rating = "Good";
      color = "bg-pes-50 border-blue-200 text-pes-700";
    } else if (total >= thresholds.average) {
      rating = "Average";
      color = "bg-yellow-50 border-yellow-200 text-yellow-700";
    } else {
      rating = "Needs Improvement";
      color = "bg-danger-50 border-danger-100 text-danger-700";
    }

    setResult({ score: total, rating, color });

    // Save to backend
    setSaving(true);
    try {
      const token = getAccessToken();
      const res = await apiFetch("/api/savePerformanceResult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          total_score: total,
          rating,
          thresholds,
          criteria
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Performance result calculated and saved!");
      } else {
        setErrorMsg(data.error || "Failed to save results.");
      }
    } catch (e) {
      setErrorMsg("Network error when saving results.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-pes border-t-transparent mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full mx-auto max-w-7xl">
      <div className="mb-4">
        <Link href="/models" className="inline-flex items-center text-sm text-muted hover:text-pes transition-colors">
          <ArrowLeft2 size="16" className="mr-1" /> Back to Models
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Performance Measurement</h1>
          <p className="text-body mb-6 max-w-2xl">
            Evaluate staff achievement criteria based on competence, integrity, compatibility, and use of resources. Data is automatically populated from the user's latest performance assessments.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/performance/history"
            className="bg-white border border-line shadow-sm text-body px-4 py-2 rounded-md hover:bg-canvas font-medium text-sm transition-colors flex items-center gap-2"
          >
            <DocumentText size="16" />
            View History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column - Criteria */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-line overflow-hidden shadow-sm">
            <div className="flex justify-between items-center px-6 py-4 border-b border-line bg-canvas">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pes-50 flex items-center justify-center text-pes-600">
                  <Star size="16" variant="Bold" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-strong">Achievement Criteria</h2>
                </div>
              </div>
              <Link
                href="/downloadables/performance_table.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-pes hover:text-pes-800 transition-colors bg-white px-3 py-1.5 rounded-md border border-line shadow-sm flex items-center gap-2"
              >
                <DocumentText size="16" />
                Reference Table
              </Link>
            </div>

            <div className="p-6 space-y-4">
              {criteria.map((criterion, index) => {
                const subtotal = criterion.scores.length > 0
                  ? criterion.scores.reduce((a, b) => a + b, 0) / criterion.scores.length
                  : 0;
                const weighted = subtotal * criterion.weight;

                return (
                  <div key={index} className="border border-line rounded-lg overflow-hidden">
                    <div 
                      className="w-full text-left px-5 py-3 bg-canvas flex justify-between items-center cursor-pointer hover:bg-line/50 transition-colors"
                      onClick={() => toggleCriterion(index)}
                    >
                      <span className="font-semibold text-strong">{criterion.name}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm" onClick={(e) => e.stopPropagation()}>
                          <span className="font-medium text-body">Weight:</span>
                          <input
                            type="number"
                            step="0.05"
                            value={criterion.weight}
                            onChange={(e) => updateWeight(index, Number(e.target.value))}
                            className="w-20 rounded border border-line px-2 py-1 text-sm outline-none focus:border-pes bg-white"
                          />
                        </div>
                        <svg className={`w-5 h-5 text-muted transition-transform ${criterion.open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>

                    {criterion.open && (
                      <div className="p-5 bg-white border-t border-line">
                        {criterion.scores.length === 0 ? (
                          <p className="text-sm text-muted italic">No scores recorded for this criterion.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {criterion.scores.map((s, i) => (
                              <div key={i} className="px-3 py-1.5 bg-canvas border border-line rounded-md text-sm font-medium text-body">
                                Score {i + 1}: <span className="text-pes ml-1">{s}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-4 border-t border-line bg-canvas -mx-5 -mb-5 px-5 py-3">
                          <span className="text-sm font-medium text-body">Average Subtotal: {subtotal.toFixed(2)}</span>
                          <span className="text-sm font-bold text-strong">Weighted: {weighted.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Thresholds & Result */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
            <h2 className="text-lg font-bold text-strong mb-1">Rating Thresholds</h2>
            <p className="text-xs text-muted mb-6">Define the minimum score for each rating tier</p>
            
            <div className="space-y-4">
              <div className="block">
                <div className="flex items-center text-sm font-semibold text-body mb-1.5">
                  <span className="truncate">Excellent (≥)</span>
                  <InfoPopover text="Minimum score for Excellent rating." />
                </div>
                <input
                  type="number"
                  value={thresholds.excellent}
                  onChange={(e) => setThresholds({ ...thresholds, excellent: Number(e.target.value) })}
                  className="block w-full rounded-md border border-line bg-canvas focus:bg-white px-3 py-2 text-sm focus:border-pes outline-none transition-all"
                />
              </div>
              <div className="block">
                <span className="block text-sm font-semibold text-body mb-1.5">Good (≥)</span>
                <input
                  type="number"
                  value={thresholds.good}
                  onChange={(e) => setThresholds({ ...thresholds, good: Number(e.target.value) })}
                  className="block w-full rounded-md border border-line bg-canvas focus:bg-white px-3 py-2 text-sm focus:border-pes outline-none transition-all"
                />
              </div>
              <div className="block">
                <span className="block text-sm font-semibold text-body mb-1.5">Average (≥)</span>
                <input
                  type="number"
                  value={thresholds.average}
                  onChange={(e) => setThresholds({ ...thresholds, average: Number(e.target.value) })}
                  className="block w-full rounded-md border border-line bg-canvas focus:bg-white px-3 py-2 text-sm focus:border-pes outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
            <h2 className="text-lg font-bold text-strong mb-4">Calculate & Save</h2>
            
            {errorMsg && <p className="text-danger-600 font-medium text-sm mb-4">{errorMsg}</p>}
            {successMsg && <p className="text-green-600 font-medium text-sm mb-4">{successMsg}</p>}

            <button
              onClick={calculateScore}
              disabled={saving}
              className="w-full py-3 bg-pes text-white rounded-lg hover:bg-pes-800 transition-colors font-medium shadow-sm flex justify-center items-center gap-2"
            >
              {saving ? "Saving..." : (
                <>
                  <Calculator size="18" />
                  Evaluate Performance
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
