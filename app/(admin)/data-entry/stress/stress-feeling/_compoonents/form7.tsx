"use client";
import { useEffect, useState } from "react";

const feelings = [
  "Anger Towards Others",
  "Depressive States",
  "Anxiety Anticipatory",
  "Physical Feelings",
  "Self-Blame",
];

const categories = [
  { key: "organizational", label: "Organization" },
  { key: "student", label: "Student" },
  { key: "administrative", label: "Administrative" },
  { key: "teacher", label: "Teacher" },
  { key: "parents", label: "Parent" },
  { key: "occupational", label: "Occupational" },
  { key: "personal", label: "Personal" },
  { key: "academic_program", label: "Academic Program" },
  { key: "negative_public_attitude", label: "Negative Public Attitude" },
  { key: "misc", label: "Miscellaneous" },
];

// Staff choose a simple 1–10 rating per cell; the system maps that onto the
// category's real range (0…max from Form 5) via (choice / 10) × max. The max is
// never shown to the staff member.
const SCALE = 10;

export default function Form7({ onSave }: { onSave: (data: any) => void }) {
  const [values, setValues] = useState<Record<string, Record<string, number>>>({});
  const [maxScores, setMaxScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Maximums come from the CYCLE limits (mean of Form 5 across all staff), not
    // the individual's own Form 5 scores.
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

  const handleChange = (cat: string, feel: string, val: number) => {
    setValues((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], [feel]: val },
    }));
  };

  // Map a raw 1–10 choice onto the category's real range using its Form 5 limit.
  const mapCell = (catKey: string, raw: number) => {
    const max = maxScores[catKey] ?? 0;
    return Math.round(((raw || 0) / SCALE) * max);
  };

  // Report the full feelings matrix up to the page whenever it changes. `values`
  // sent up is the MAPPED matrix (real units) — that's what the report reads —
  // while the raw 1–10 selections are kept alongside for the record.
  useEffect(() => {
    const mappedValues: Record<string, Record<string, number>> = {};
    categories.forEach((c) => {
      mappedValues[c.key] = {};
      feelings.forEach((f) => {
        mappedValues[c.key][f] = mapCell(c.key, values[c.key]?.[f] || 0);
      });
    });
    const rowTotals = categories.map((c) => ({
      key: c.key,
      label: c.label,
      total: feelings.reduce((s, f) => s + mappedValues[c.key][f], 0),
    }));
    const colTotals = feelings.map((f) => ({
      feeling: f,
      total: categories.reduce((s, c) => s + mappedValues[c.key][f], 0),
    }));
    const grandTotal = rowTotals.reduce((s, r) => s + r.total, 0);
    const totalElements = categories.length * feelings.length;
    const ratio = totalElements > 0 ? grandTotal / totalElements : 0;
    onSave({
      values: mappedValues,
      rawValues: values,
      totals: { rowTotals, colTotals, grandTotal, ratio: ratio.toFixed(4) },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, maxScores]);

  if (loading) return <p className="p-12">Loading stress form...</p>;

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-bold mb-1">Form 7: Stress Feelings</h2>
      <p className="text-sm text-gray-500 mb-4">
        For each stress category, rate how often you experience each feeling on a scale of 1 (rarely) to 10 (very often).
      </p>
      <table className="w-full border border-gray-300 text-sm">
        <thead>
          <tr className="bg-purple-200">
            <th className="border px-3 py-2 text-left">Stress Category / Freq</th>
            {feelings.map((feel) => (
              <th key={feel} className="border px-3 py-2 text-center">
                {feel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, idx) => (
            <tr key={cat.key} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border p-2 font-medium">{cat.label}</td>
              {feelings.map((feel) => (
                <td key={feel} className="border px-3 py-2 text-center">
                  <select
                    value={values[cat.key]?.[feel] ?? ""}
                    onChange={(e) =>
                      handleChange(cat.key, feel, parseInt(e.target.value) || 0)
                    }
                    className="w-16 border rounded text-center"
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
  );
}
