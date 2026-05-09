"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

type JWTPayload = {
  name?: string;
  role?: string;
  org?: number;
};

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

export default function Form6({ onSave }: { onSave: (data: number) => void }) {
  const [values, setValues] = useState<Record<string, Record<string, number>>>({});
  const [maxScores, setMaxScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return setLoading(false);

        const decoded = jwtDecode<JWTPayload>(token);
        const user_name = decoded.name;
        const org = decoded.org;

        if (!user_name || !org) return setLoading(false);

        const res = await fetch(`/api/getStressScores`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_name, org }),
        });

        const info = await res.json();
        if (!info.data) return setLoading(false);

        const numericScores: Record<string, number> = Object.fromEntries(
          Object.entries(info.data).map(([key, val]) => [key, Number(val) || 0])
        );
        setMaxScores(numericScores);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching scores:", err);
        setLoading(false);
      }
    };

    fetchScores();
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

  const handleNext = () => {
    const scores: Record<string, number> = {};
    categories.forEach((cat) => {
      const dbField = categoryMap[cat];
      scores[dbField] = getRowTotal(cat);
    });

    const data = {
      scores,
      totals: {
        rowTotals: categories.map((c) => ({
          category: c,
          total: getRowTotal(c),
        })),
        colTotals: themes.map((t) => ({
          theme: t,
          total: getColTotal(t),
          percent: getColPercent(t),
        })),
        grandTotal,
      },
    };

    onSave(data.totals.grandTotal);
  };

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
