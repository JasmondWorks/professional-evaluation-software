"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Form6 from "./_compoonents/form6";
import Form7 from "./_compoonents/form7";

function StatusScreen({ title, body, ctaLabel, ctaHref }: { title: string; body: string; ctaLabel?: string; ctaHref?: string }) {
  return (
    <div className="w-full p-12 flex justify-center">
      <div className="max-w-lg w-full bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm mt-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-600 mb-6">{body}</p>
        {ctaLabel && ctaHref && (
          <Link href={ctaHref} className="inline-block bg-pes text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors">{ctaLabel}</Link>
        )}
      </div>
    </div>
  );
}

export default function MultiStepStressForm() {
  const [step, setStep] = useState(1);
  const [form6Data, setForm6Data] = useState<any>(null);
  const [form7Data, setForm7Data] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cycle, setCycle] = useState<any>(null);
  const [loadingCycle, setLoadingCycle] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch("/api/stress/active-cycle", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setCycle(d))
      .catch(() => setCycle({ active: false }))
      .finally(() => setLoadingCycle(false));
  }, []);

  const nextStep = () => setStep((s) => Math.min(s + 1, 2));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const payload = {
        type: "stress_assessment",
        form6: form6Data,
        form7: form7Data,
      };

      const res = await fetch("/api/saveStressAssessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.message || "Could not submit the form.");
        return;
      }
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Error saving stress assessment");
    } finally {
      setLoading(false);
    }
  };

  // ---- Cycle gating: Form 6/7 only open in the feeling phase ----
  if (loadingCycle) {
    return (
      <div className="w-full p-12 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pes mt-16" />
      </div>
    );
  }
  if (!cycle?.active) {
    return (
      <StatusScreen
        title="No stress exercise is open right now"
        body="Your organization hasn't opened a stress exercise at the moment. You'll be notified on your dashboard when a form is available."
      />
    );
  }
  // Already submitted this cycle (now or earlier) → thank-you screen.
  if (success || cycle?.form6?.submitted) {
    return (
      <StatusScreen
        title="Your theme & feeling form is submitted ✅"
        body="Thanks — your response has been recorded for this cycle. You fill this form once; the results are compiled by your organization."
        ctaLabel="Back to dashboard"
        ctaHref="/dashboard"
      />
    );
  }

  if (!cycle?.form6?.open) {
    return (
      <StatusScreen
        title="The theme & feeling form isn't open yet"
        body="Form 6 opens once the stress category form (Form 5) has closed and your organization has computed the setting. Please check back, or complete Form 5 first if it's still open."
        ctaLabel="Go to the Stress Category form"
        ctaHref="/data-entry/stress/stress-category"
      />
    );
  }

  return (
    <div className="w-full p-8">
      {loading && <p className="text-gray-500">Saving your responses...</p>}
      {success && (
        <p className="text-green-600 font-semibold">
          Stress assessment submitted successfully!
        </p>
      )}

      {step === 1 && <Form6 onSave={(data) => setForm6Data(data)} />}
      {step === 2 && <Form7 onSave={(data) => setForm7Data(data)} />}

      <div className="mt-8 flex justify-between">
        {step > 1 && (
          <button
            onClick={prevStep}
            className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Back
          </button>
        )}
        {step < 2 && (
          <button
            onClick={nextStep}
            className="px-6 py-2 rounded text-white bg-purple-600 hover:bg-purple-700"
          >
            Next
          </button>
        )}
        {step === 2 && (
          <button
            disabled={loading}
            onClick={handleFinalSubmit}
            className="px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit All"}
          </button>
        )}
      </div>
    </div>
  );
}
