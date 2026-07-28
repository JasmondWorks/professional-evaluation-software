"use client";
import { useEffect, useState } from "react";

const categories = [
  "Organization",
  "Student",
  "Administrative",
  "Teacher",
  "Parent",
  "Occupational",
  "Personal",
  "Academic Program",
  "Negative Public Attitude",
  "Miscellaneous",
];

const themes = [
  "Control of Time",
  "Inference with Instruction",
  "Overload Qualitative",
  "Overload Quantitative",
  "Under-load Qualitative",
  "Under-load Quantitative",
  "General Performance",
  "Threat to Self",
  "Precipitate Change",
];

const categoryMap: Record<string, string> = {
  Organization: "organizational",
  Student: "student",
  Administrative: "administrative",
  Teacher: "teacher",
  Parent: "parents",
  Occupational: "occupational",
  Personal: "personal",
  "Academic Program": "academic_program",
  "Negative Public Attitude": "negative_public_attitude",
  Miscellaneous: "misc",
};

// Staff choose a simple 1–10 rating per cell. The system maps that choice onto
// the category's real range (0…max) — where `max` is the per-category limit
// computed from Form 5 — via (choice / 10) × max. The max is NOT shown to the
// staff member; they only ever deal with the 1–10 scale.
const SCALE = 10;

export default function Form6({ onSave }: { onSave: (data: any) => void }) {
  const [values, setValues] = useState<Record<string, Record<string, number>>>({});
  const [maxScores, setMaxScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The per-category maximums come from the CYCLE limits — the mean of Form 5
    // across all staff (computed by "Run Setting") — NOT the individual's own
    // Form 5 scores. This is the whole reason Form 5 must close before Form 6.
    const token = localStorage.getItem("access_token");
    fetch(`/api/stress/limits`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        const limits = (d?.limits || {}) as Record<string, number>;
        const rounded: Record<string, number> = {};
        for (const [k, v] of Object.entries(limits)) {
          rounded[k] = Math.max(0, Math.round(Number(v) || 0));
        }
        setMaxScores(rounded);
      })
      .catch((err) => console.error("Error fetching cycle limits:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (cat: string, theme: string, val: number) => {
    setValues((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], [theme]: val },
    }));
  };

  // Map a raw 1–10 choice onto the category's real range using its Form 5 limit.
  const mapCell = (cat: string, raw: number) => {
    const max = maxScores[categoryMap[cat]] ?? 0;
    return Math.round(((raw || 0) / SCALE) * max);
  };

  // Report the FULL matrix up to the page whenever it changes. We send the raw
  // 1–10 selections (for the record) AND the mapped values / totals in the
  // category's real units, which are what downstream aggregation reports on.
  useEffect(() => {
    const mappedValues: Record<string, Record<string, number>> = {};
    const categoryTotals: Record<string, number> = {};
    categories.forEach((c) => {
      mappedValues[c] = {};
      let rowSum = 0;
      themes.forEach((t) => {
        const m = mapCell(c, values[c]?.[t] || 0);
        mappedValues[c][t] = m;
        rowSum += m;
      });
      categoryTotals[categoryMap[c]] = rowSum;
    });
    const themeTotalsRaw = themes.map((t) => ({
      theme: t,
      total: categories.reduce((sum, c) => sum + mapCell(c, values[c]?.[t] || 0), 0),
    }));
    const grandTotal = themeTotalsRaw.reduce((s, x) => s + x.total, 0);
    const themeTotals = themeTotalsRaw.map((x) => ({
      ...x,
      percent: grandTotal > 0 ? ((x.total / grandTotal) * 100).toFixed(2) : "0.00",
    }));
    onSave({ values, mappedValues, categoryTotals, themeTotals, grandTotal });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, maxScores]);

  if (loading) return <p className="p-12">Loading stress form...</p>;

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-1">Form 6: Stress Themes</h2>
      <p className="text-sm text-gray-500 mb-4">
        For each stress category, rate how strongly each theme applies to you on a scale of 1 (lowest) to 10 (highest).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-purple-200">
              <th className="border p-2">Stress Category</th>
              {themes.map((t) => (
                <th key={t} className="border p-2">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat}>
                <td className="border p-2 font-medium">{cat}</td>
                {themes.map((theme) => (
                  <td key={theme} className="border p-2">
                    <select
                      className="w-20 border rounded p-1 text-center"
                      value={values[cat]?.[theme] ?? ""}
                      onChange={(e) =>
                        handleChange(cat, theme, parseInt(e.target.value) || 0)
                      }
                    >
                      <option value="">--</option>
                      {Array.from({ length: SCALE }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
