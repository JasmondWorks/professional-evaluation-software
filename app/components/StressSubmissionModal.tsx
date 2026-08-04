"use client";

// Shows a staff member's Form 6/7 submission so a head can review the actual
// content before approving (instead of approving a bare "Submitted" badge).
// Renders the raw 1–10 answers for themes and feelings, plus a short summary.

import { useEffect, useState } from "react";
import { apiFetch } from '@/app/utils/apiFetch';

const CATEGORIES = [
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
const THEMES = [
  "Control of Time", "Inference with Instruction", "Overload Qualitative",
  "Overload Quantitative", "Under-load Qualitative", "Under-load Quantitative",
  "General Performance", "Threat to Self", "Precipitate Change",
];
const FEELINGS = [
  "Anger Towards Others", "Depressive States", "Anxiety Anticipatory",
  "Physical Feelings", "Self-Blame",
];

function Cell({ v }: { v?: number }) {
  return (
    <td className={`border px-2 py-1 text-center ${v ? "bg-success-50 font-semibold text-success-700" : "text-muted"}`}>
      {v || "–"}
    </td>
  );
}

export default function StressSubmissionModal({ name, onClose }: { name: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // apiFetch appends the access token internally.
    apiFetch(`/api/stress/submission?name=${encodeURIComponent(name)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Failed to load submission");
        return d;
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [name]);

  const themes = data?.assessment?.stressThemes;
  const feelings = data?.assessment?.stressFeelings;
  const topThemes: { theme: string; total: number }[] = Array.isArray(themes?.themeTotals)
    ? [...themes.themeTotals].sort((a: any, b: any) => b.total - a.total).slice(0, 3)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-strong">{name}</h2>
            <p className="text-sm text-muted">Theme &amp; feeling submission for the current cycle</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-body text-2xl leading-none">&times;</button>
        </div>

        {loading && <p className="text-muted py-8 text-center">Loading submission…</p>}
        {error && <p className="text-danger-600 bg-danger-50 border border-danger-100 rounded-md p-3 text-sm">{error}</p>}

        {data && !loading && (
          <div className="space-y-6">
            {topThemes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted self-center">Most-reported themes:</span>
                {topThemes.map((t) => (
                  <span key={t.theme} className="text-xs bg-pes-50 text-pes-700 rounded-full px-3 py-1 font-medium">
                    {t.theme} ({t.total})
                  </span>
                ))}
              </div>
            )}

            <div>
              <h3 className="font-semibold text-strong mb-2">Form 6 — Themes (rated 1–10)</h3>
              <div className="overflow-x-auto border border-line rounded-lg">
                <table className="text-xs border-collapse min-w-[720px]">
                  <thead>
                    <tr className="bg-canvas">
                      <th className="border px-2 py-1 text-left">Category</th>
                      {THEMES.map((t) => <th key={t} className="border px-2 py-1 font-medium">{t}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORIES.map((c) => (
                      <tr key={c.key}>
                        <td className="border px-2 py-1 font-medium whitespace-nowrap">{c.label}</td>
                        {THEMES.map((t) => <Cell key={t} v={themes?.values?.[c.label]?.[t]} />)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-strong mb-2">Form 7 — Feelings (rated 1–10)</h3>
              <div className="overflow-x-auto border border-line rounded-lg">
                <table className="text-xs border-collapse min-w-[520px]">
                  <thead>
                    <tr className="bg-canvas">
                      <th className="border px-2 py-1 text-left">Category</th>
                      {FEELINGS.map((f) => <th key={f} className="border px-2 py-1 font-medium">{f}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORIES.map((c) => (
                      <tr key={c.key}>
                        <td className="border px-2 py-1 font-medium whitespace-nowrap">{c.label}</td>
                        {FEELINGS.map((f) => <Cell key={f} v={feelings?.rawValues?.[c.key]?.[f]} />)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
