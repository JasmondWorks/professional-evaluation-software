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

  const getRowTotal = (catKey: string) =>
    feelings.reduce((sum, f) => sum + (values[catKey]?.[f] || 0), 0);

  const getColTotal = (feel: string) =>
    categories.reduce((sum, c) => sum + (values[c.key]?.[feel] || 0), 0);

  const getGrandTotal = () =>
    categories.reduce((sum, c) => sum + getRowTotal(c.key), 0);

  const totalElements = categories.length * feelings.length;
  const ratio = totalElements > 0 ? getGrandTotal() / totalElements : 0;

  const handleSubmit = () => {
    const data = {
      values,
      totals: {
        rowTotals: categories.map((c) => ({
          key: c.key,
          label: c.label,
          total: getRowTotal(c.key),
        })),
        colTotals: feelings.map((f) => ({
          feeling: f,
          total: getColTotal(f),
        })),
        grandTotal: getGrandTotal(),
        ratio: ratio.toFixed(4),
      },
    };

    onSave(data);
  };

  if (loading) return <p className="p-12">Loading stress scores...</p>;

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Form 7: Stress Feelings</h2>
      <table className="w-full border border-gray-300 text-sm">
        <thead>
          <tr className="bg-purple-200">
            <th className="border px-3 py-2 text-left">Stress Category / Freq</th>
            {feelings.map((feel) => (
              <th key={feel} className="border px-3 py-2 text-center">
                {feel}
              </th>
            ))}
            <th className="border px-3 py-2 text-center">Row Total</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, idx) => (
            <tr key={cat.key} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border p-2 font-medium">
                {cat.label} ({maxScores[cat.key] ?? 0})
              </td>
              {feelings.map((feel) => {
                const max = maxScores[cat.key] ?? 0;
                return (
                  <td key={feel} className="border px-3 py-2 text-center">
                    <select
                      value={values[cat.key]?.[feel] ?? ""}
                      onChange={(e) =>
                        handleChange(cat.key, feel, parseInt(e.target.value) || 0)
                      }
                      className="w-16 border rounded text-center"
                    >
                      <option value="">--</option>
                      {Array.from({ length: max + 1 }, (_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </td>
                );
              })}
              <td className="border px-3 py-2 text-center font-semibold">
                {getRowTotal(cat.key)}
              </td>
            </tr>
          ))}
          {/* <tr className="bg-purple-100 font-bold">
            <td className="border px-3 py-2">Column Totals (∑)</td>
            {feelings.map((feel) => (
              <td key={feel} className="border px-3 py-2 text-center">
                {getColTotal(feel)}
              </td>
            ))}
            <td className="border px-3 py-2 text-center">{getGrandTotal()}</td>
          </tr> */}
        </tbody>
      </table>
    </div>
  );
}
