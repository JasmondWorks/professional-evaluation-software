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

  const getRowTotal = (cat: string) =>
    themes.reduce((sum, t) => sum + (values[cat]?.[t] || 0), 0);

  const getColTotal = (theme: string) =>
    categories.reduce((sum, c) => sum + (values[c]?.[theme] || 0), 0);

  const getGrandTotal = () =>
    categories.reduce((sum, c) => sum + getRowTotal(c), 0);

  const grandTotal = getGrandTotal();

  const getColPercent = (theme: string) =>
    grandTotal > 0 ? ((getColTotal(theme) / grandTotal) * 100).toFixed(2) : "0.00";

  // Report the FULL matrix up to the page whenever it changes, so the whole
  // category×theme grid is saved (not just a single total). `values` is keyed by
  // category LABEL; also expose totals keyed by category KEY for aggregation.
  useEffect(() => {
    const categoryTotals: Record<string, number> = {};
    categories.forEach((c) => {
      categoryTotals[categoryMap[c]] = getRowTotal(c);
    });
    onSave({
      values,
      categoryTotals,
      themeTotals: themes.map((t) => ({
        theme: t,
        total: getColTotal(t),
        percent: getColPercent(t),
      })),
      grandTotal,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  if (loading) return <p className="p-12">Loading stress scores...</p>;

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Form 6: Stress Themes</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-purple-200">
              <th className="border p-2">Stress Category</th>
              {themes.map((t) => (
                <th key={t} className="border p-2">{t}</th>
              ))}
              <th className="border p-2">Row Total</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const max = maxScores[categoryMap[cat]] ?? 0;
              return (
                <tr key={cat}>
                  <td className="border p-2 font-medium">
                    {cat} ({max})
                  </td>
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
                        {Array.from({ length: max + 1 }, (_, i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </td>
                  ))}
                  <td className="border p-2 text-center font-semibold bg-gray-100">
                    {getRowTotal(cat)}
                  </td>
                </tr>
              );
            })}
            {/* <tr className="bg-purple-100 font-bold">
              <td className="border p-2">Column Totals (∑)</td>
              {themes.map((theme) => (
                <td key={theme} className="border p-2 text-center">
                  {getColTotal(theme)}
                </td>
              ))}
              <td className="border p-2 text-center">{grandTotal}</td>
            </tr> */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
