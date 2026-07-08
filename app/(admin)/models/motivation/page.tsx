"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft2, Add, Trash, Setting2, TrendUp } from "iconsax-react";
import { getAccessToken } from "@/app/utils/auth";
import InfoPopover from "@/app/components/ui/InfoPopover";

interface SubItem {
  label: string;
  score: number;
}

interface Category {
  name: string;
  weight: number;
  subItems: SubItem[];
  open: boolean;
}

export default function StaffMotivationPage() {
  const [categories, setCategories] = useState<Category[]>([
    {
      name: "Job Satisfaction",
      weight: 0.2,
      subItems: [{ label: "Satisfaction with tasks", score: 0 }],
      open: true,
    },
    {
      name: "Work Environment",
      weight: 0.15,
      subItems: [{ label: "Physical work conditions", score: 0 }],
      open: true,
    },
    {
      name: "Rewards & Incentives",
      weight: 0.15,
      subItems: [{ label: "Fairness of compensation", score: 0 }],
      open: true,
    },
    {
      name: "Opportunities for Growth",
      weight: 0.15,
      subItems: [{ label: "Training opportunities", score: 0 }],
      open: true,
    },
    {
      name: "Leadership Quality",
      weight: 0.2,
      subItems: [{ label: "Support from management", score: 0 }],
      open: true,
    },
    {
      name: "Communication Effectiveness",
      weight: 0.15,
      subItems: [{ label: "Clarity of goals", score: 0 }],
      open: true,
    },
  ]);

  const [thresholds, setThresholds] = useState({
    high: 80,
    moderate: 60,
  });

  const [result, setResult] = useState<{
    score: number;
    rating: string;
    color: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateCategory = (index: number, field: keyof Category, value: any) => {
    const updated = [...categories];
    (updated as any)[index][field] = value;
    setCategories(updated);
  };

  const updateSubItem = (
    cIndex: number,
    sIndex: number,
    field: keyof SubItem,
    value: any,
  ) => {
    const updated = [...categories];
    (updated as any)[cIndex].subItems[sIndex][field] = value;
    setCategories(updated);
  };

  const addSubItem = (cIndex: number) => {
    const updated = [...categories];
    updated[cIndex].subItems.push({ label: "New Sub-item", score: 0 });
    setCategories(updated);
  };

  const removeSubItem = (cIndex: number, sIndex: number) => {
    const updated = [...categories];
    updated[cIndex].subItems.splice(sIndex, 1);
    setCategories(updated);
  };

  const toggleCategory = (index: number) => {
    const updated = [...categories];
    updated[index].open = !updated[index].open;
    setCategories(updated);
  };

  const calculateScore = async () => {
    setMessage(null);
    setErrorMsg(null);
    let total = 0;
    
    // Validate weights sum to 1.0
    const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      setErrorMsg("Category weights must sum up to exactly 1.0");
      return;
    }

    categories.forEach((cat) => {
      const subtotal = cat.subItems.reduce((sum, s) => sum + s.score, 0);
      total += subtotal * cat.weight;
    });

    let rating = "";
    let color = "";

    if (total >= thresholds.high) {
      rating = "High Motivation";
      color = "text-green-700 bg-green-50 border-green-200";
    } else if (total >= thresholds.moderate) {
      rating = "Moderate Motivation";
      color = "text-yellow-700 bg-yellow-50 border-yellow-200";
    } else {
      rating = "Low Motivation";
      color = "text-red-700 bg-red-50 border-red-200";
    }

    setResult({ score: total, rating, color });

    // 🔥 Save to backend
    setSaving(true);
    
    try {
      const token = getAccessToken();
      const res = await fetch("/api/motivation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          total_score: total,
          rating,
          thresholds,
          categories,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Motivation record saved successfully!");
      } else {
        console.error("Error saving:", data);
        setErrorMsg(`Save failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Request error:", err);
      setErrorMsg("Could not connect to server.");
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-2xl font-bold mb-2">Staff Motivation</h1>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Evaluate staff motivation across various parameters by weighting scores for job satisfaction, environment, and opportunities.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/models/motivation/history"
            className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            View History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Categories */}
        <div className="xl:col-span-2 space-y-4">
          {categories.map((cat, cIndex) => (
            <div key={cIndex} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div 
                className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-100 cursor-pointer"
                onClick={() => toggleCategory(cIndex)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <span className="font-bold text-sm">{cIndex + 1}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm font-medium text-gray-600">Weight:</span>
                    <input
                      type="number"
                      step="0.05"
                      value={cat.weight}
                      onChange={(e) => updateCategory(cIndex, "weight", Number(e.target.value))}
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-pes"
                    />
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${cat.open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              
              {cat.open && (
                <div className="p-6">
                  <div className="space-y-4 mb-4">
                    {cat.subItems.map((sub, sIndex) => (
                      <div key={sIndex} className="flex gap-4 items-start">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Parameter Label</label>
                          <input
                            type="text"
                            value={sub.label}
                            onChange={(e) => updateSubItem(cIndex, sIndex, "label", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none"
                            placeholder="Enter parameter name..."
                          />
                        </div>
                        <div className="w-32">
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Score (0-100)</label>
                          <input
                            type="number"
                            value={sub.score}
                            onChange={(e) => updateSubItem(cIndex, sIndex, "score", Number(e.target.value))}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none"
                          />
                        </div>
                        <div className="pt-6">
                          <button
                            onClick={() => removeSubItem(cIndex, sIndex)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors"
                            title="Remove Parameter"
                          >
                            <Trash size="18" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addSubItem(cIndex)}
                    className="flex items-center gap-1 text-sm font-medium text-pes hover:text-blue-800 transition-colors"
                  >
                    <Add size="16" /> Add Parameter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Column - Thresholds & Save */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <Setting2 size="16" variant="Bold" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Thresholds</h2>
                <p className="text-xs text-gray-500">Define rating limits</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="block">
                <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="truncate">High Motivation (≥)</span>
                  <InfoPopover text="Scores at or above this will be rated High Motivation." />
                </div>
                <input
                  type="number"
                  value={thresholds.high}
                  onChange={(e) => setThresholds({ ...thresholds, high: Number(e.target.value) })}
                  className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
                />
              </div>
              <div className="block">
                <div className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="truncate">Moderate Motivation (≥)</span>
                  <InfoPopover text="Scores at or above this will be rated Moderate Motivation." />
                </div>
                <input
                  type="number"
                  value={thresholds.moderate}
                  onChange={(e) => setThresholds({ ...thresholds, moderate: Number(e.target.value) })}
                  className="mt-1.5 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white px-3 py-2 text-sm focus:border-pes focus:ring-1 focus:ring-pes outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Calculate & Save</h2>
            
            {errorMsg && <p className="text-red-600 font-medium text-sm mb-4">{errorMsg}</p>}
            {message && <p className="text-green-600 font-medium text-sm mb-4">{message}</p>}

            <button
              onClick={calculateScore}
              disabled={saving}
              className="w-full py-3 bg-pes text-white rounded-lg hover:bg-blue-900 transition-colors font-medium shadow-sm flex justify-center items-center gap-2"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <TrendUp size="18" />
                  Evaluate Motivation
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
