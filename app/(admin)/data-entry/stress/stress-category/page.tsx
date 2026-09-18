"use client";
import { useState } from "react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { STRESS_INSTRUMENT, CategoryKey } from "@/app/lib/stress/instrument";
import { scoreItem } from "@/app/lib/stress/scoring";
import { notify } from "@/lib/toast";
import { useActiveCycle } from "@/app/components/useActiveCycle";
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';

type JWTPayload = {
  name?: string;
  role?: string;
  org?: string;
};

const FORM6_URL = "/data-entry/stress/stress-feeling";

// A friendly full-screen state (no open form to fill).
function StatusScreen({
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="w-full p-12 flex justify-center">
      <div className="max-w-lg w-full bg-white border border-line rounded-xl p-8 text-center shadow-sm mt-10">
        <h1 className="text-2xl font-bold text-strong mb-3">{title}</h1>
        <p className="text-body mb-6">{body}</p>
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="inline-block bg-pes text-white px-6 py-3 rounded-lg font-medium hover:bg-pes-800 transition-colors"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function StressForm5() {
  const [values, setValues] = useState<Record<string, number>>({});
  const [currentStep, setCurrentStep] = useState(0);
  // Live cycle status — polls + refetches on focus, so the form opens/closes
  // and the "already submitted" state update without a page refresh.
  const { data: cycle, loading: loadingCycle } = useActiveCycle();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  // #9: every item in a category must be answered before you can advance / submit.
  const isCategoryComplete = (cat: (typeof STRESS_INSTRUMENT)[number]) =>
    cat.items.every((item) => (values[`${cat.key}-${item.label}`] ?? 0) > 0);

  // Each category's total = sum of its item scores (choice/10 × item max),
  // computed from the instrument so the weights live in exactly one place. Keyed
  // by category key, which matches the stress_scores columns.
  const scores = {} as Record<CategoryKey, number>;
  for (const cat of STRESS_INSTRUMENT) {
    scores[cat.key] = cat.items.reduce(
      (sum, item) => sum + scoreItem(values[`${cat.key}-${item.label}`] ?? 0, item.max),
      0,
    );
  }

  const handleSubmit = async () => {
    if (submitting) return; // guard against double-submit
    setSubmitting(true);
    try {
      const token = getAccessToken();
      const user: JWTPayload = jwtDecode(token || "");

      const res = await apiFetch("/api/saveStressScores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          user_name: user.name,
          scores,
        }),
      });

      // Read the body defensively — a gateway/cold-start error can return
      // non-JSON, which used to throw and show a false "something went wrong"
      // even though the row saved.
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        // "Already submitted" is a success from the user's point of view.
        if (res.status === 409 && /already submitted/i.test(data?.message || "")) {
          setSubmitted(true);
          return;
        }
        notify.error(data?.message || "Could not submit the form. Please try again.");
        return;
      }
      notify.success("Your stress category form has been submitted.");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      notify.error("Network problem submitting the form. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategory = STRESS_INSTRUMENT[currentStep];
  const currentComplete = currentCategory ? isCategoryComplete(currentCategory) : false;
  const allComplete = STRESS_INSTRUMENT.every(isCategoryComplete);

  // ---- Cycle gating: decide whether the form is fillable ----
  if (loadingCycle) {
    return (
      <div className="w-full p-12 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-pes border-t-transparent mt-16" />
      </div>
    );
  }

  // Just submitted (this session) or already submitted for the cycle → thank-you.
  // Only offer the Form 6 link if it's actually open now; otherwise avoid the
  // dead-end (Form 6 opens later, once the org runs the setting).
  if (submitted || cycle?.form5?.submitted) {
    const form6Open = cycle?.form6?.open;
    return (
      <StatusScreen
        title="You're all set for the stress category form ✅"
        body={
          form6Open
            ? "Thanks — your response has been recorded for this cycle. You only fill this form once. The theme & feeling form is open — complete that next."
            : "Thanks — your response has been recorded for this cycle. You only fill this form once. When the theme & feeling form opens, you'll be nudged from your dashboard."
        }
        ctaLabel={form6Open ? "Go to the Theme & Feeling form" : undefined}
        ctaHref={form6Open ? FORM6_URL : undefined}
      />
    );
  }

  // No cycle running.
  if (!cycle?.active) {
    return (
      <StatusScreen
        title="No stress exercise is open right now"
        body="Your organization hasn't opened a stress exercise at the moment. You'll be notified on your dashboard when the form is available."
      />
    );
  }

  // Scheduled but not open yet (before its open date) — NOT the same as closed.
  if (cycle.form5?.status === "not_yet") {
    const opens = cycle.form5.opensAt ? new Date(cycle.form5.opensAt).toLocaleString() : null;
    return (
      <StatusScreen
        title="The stress category form hasn't opened yet"
        body={
          opens
            ? `This form opens on ${opens}. You'll be notified on your dashboard when it's ready to fill.`
            : "This form isn't open for submissions yet. You'll be notified on your dashboard when it's ready."
        }
      />
    );
  }

  // Cycle running but Form 5 window has closed. The staff member didn't fill it —
  // they may still proceed to Form 6.
  if (cycle.form5?.status === "closed" || !cycle.form5?.open) {
    const form6Open = cycle?.form6?.open;
    return (
      <StatusScreen
        title="The stress category form has closed"
        body={
          form6Open
            ? "Submissions for this form are now closed. You didn't submit it during the window, but you can still continue to the theme & feeling form."
            : "Submissions for this form are now closed. You didn't submit it during the window. When the theme & feeling form opens, you'll be nudged from your dashboard."
        }
        ctaLabel={form6Open ? "Continue to the Theme & Feeling form" : undefined}
        ctaHref={form6Open ? FORM6_URL : undefined}
      />
    );
  }

  // Form 5 is open and not yet submitted → the wizard.
  return (
    <div className="w-full p-12">
      <h1 className="text-2xl font-bold mb-6">
        Form 5: Setting the Stress Category/Staff
      </h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Step {currentStep + 1} of {STRESS_INSTRUMENT.length}: {currentCategory.label}
        </h2>
        <table className="min-w-full border border-line">
          <thead className="bg-canvas">
            <tr>
              <th className="border px-2 py-1">Item</th>
              {Array.from({ length: 10 }, (_, i) => (
                <th key={i} className="border px-2 py-1 text-center">
                  {i + 1}
                </th>
              ))}
              {/* <th className="border px-2 py-1">Weight</th> */}
            </tr>
          </thead>
          <tbody>
            {currentCategory.items.map((item, j) => (
              <tr key={j}>
                <td className="border px-2 py-1">{item.label}</td>
                {Array.from({ length: 10 }, (_, i) => (
                  <td key={i} className="border p-0 text-center">
                    <label className="flex h-10 w-full cursor-pointer items-center justify-center hover:bg-canvas transition-colors">
                      <input
                        type="radio"
                        name={`${currentCategory.key}-${item.label}`}
                        value={i + 1}
                        checked={values[`${currentCategory.key}-${item.label}`] === i + 1}
                        onChange={(e) =>
                          handleChange(
                            `${currentCategory.key}-${item.label}`,
                            parseInt(e.target.value)
                          )
                        }
                        className="h-4 w-4 cursor-pointer text-pes focus:ring-pes"
                      />
                    </label>
                  </td>
                ))}
                {/* <td className="border px-2 py-1 text-center">{item.weight}</td> */}
              </tr>
            ))}
            {/* <tr className="bg-gray-200 font-semibold">
              <td className="border px-2 py-1 text-right" colSpan={11}>
                Subtotal
              </td>
              <td className="border px-2 py-1 text-center">
                {categoryTotals[currentCategory.category]?.toFixed(2) || "0.00"}
              </td>
            </tr> */}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between">
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="bg-surface border border-line text-body px-4 py-2 rounded-lg hover:bg-line/50 transition-colors"
          >
            Back
          </button>
        )}

        {currentStep < STRESS_INSTRUMENT.length - 1 ? (
          <div className="ml-auto flex flex-col items-end gap-1">
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={!currentComplete}
              title={!currentComplete ? "Answer every item in this category to continue" : undefined}
              className="bg-pes text-white px-4 py-2 rounded-lg hover:bg-pes-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            {!currentComplete && (
              <span className="text-xs text-muted">Answer every item to continue.</span>
            )}
          </div>
        ) : (
          <div className="ml-auto flex flex-col items-end gap-1">
            <button
              onClick={handleSubmit}
              disabled={!allComplete || submitting}
              title={!allComplete ? "Answer every item in all categories before submitting" : undefined}
              className="bg-pes text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit Totals"}
            </button>
            {!allComplete && (
              <span className="text-xs text-muted">Every item in all categories must be answered.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
