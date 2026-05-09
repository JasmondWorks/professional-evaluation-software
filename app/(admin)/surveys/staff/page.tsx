"use client";
import { useState } from "react";

export default function StaffSurveyPage() {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (question: string, value: string) => {
    setResponses({ ...responses, [question]: value });
  };

  const submitSurvey = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responses),
      });
      if (!res.ok) throw new Error("Failed to submit survey");
      setMessage("Survey submitted successfully ✅");
    } catch (err: any) {
      setMessage("Error submitting survey ❌");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const scaleOptions = [0, 1, 2, 3, 4, 5];
  const yesNo = ["Yes", "No"];

  return (
    <main className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Staff Survey</h1>

      <SurveySection
        title="ON APP USE"
        questions={[
          "Rate your experience on ease of use of the App",
          "If you had the choice to repeat the decisions you took, rate your choice to repeat your action(s)",
          "Do you agree with the results displayed to you as your grade(s)",
          "Will you request for more time to reflect on your choice of action before the App was closed to actions",
          "Are the texts displayed legible enough for your viewing?",
          "Do you understand how the various sections you were asked to take actions on were well understood enough?",
          "Was the Super Admin political in the control of results display?",
          "Do you feel that there is a need for improvement on some sections of the App use?",
        ]}
        type="scale"
        options={scaleOptions}
        onChange={handleChange}
      />

      <SurveySection
        title="UNIT HEADS DECISIONS"
        questions={[
          "Was there an area where your unit head opposed to your choice of action?",
          "Were you given the option to accept or reject your Unit Head’s decision on your choice of action?",
          "If invited by an external auditor to review some decision arrived at on you, are you willing to cooperate?",
          "Were your grades rightly displayed to you?",
          "Were your results made privy to you alone?",
          "Did your Unit Head/H.O.D approve the score you scored yourself?",
          "Which of these sectors will you refer for an improvement? (Stress, Appraisal, Performance, Motivation, None)",
        ]}
        type="yesno"
        options={yesNo}
        onChange={handleChange}
      />

      <SurveySection
        title="APPRAISAL"
        questions={[
          "Rate how encompassing you feel the Appraisal model used here covers your area of activities",
          "How will you rate your Unit Head/H.O.D in terms of fairness to your score approval",
          "Rate in terms of fairness how you feel with the Appraisal activity you just completed went",
          "Rate how you feel your management is involved with the influence of the App operation",
          "How satisfied are you with the grade you scored yourself",
        ]}
        type="scale"
        options={scaleOptions}
        onChange={handleChange}
      />

      <SurveySection
        title="PERFORMANCE EVALUATION"
        questions={[
          "Rate how encompassing you feel the Performance-evaluation model used here covers your area of activities",
          "How will you rate your Unit Head/H.O.D in terms of fairness to your score approval",
          "Rate in terms of fairness how you feel the Performance-evaluation activity you just completed went",
          "Rate how you feel your management is involved with the influence of the App operation",
          "How satisfied are you with the grade you scored yourself",
        ]}
        type="scale"
        options={scaleOptions}
        onChange={handleChange}
      />

      <SurveySection
        title="MOTIVATION"
        questions={[
          "Were you informed by your management if the motivation model will be applied to your Appraisal and Performance activities done?",
          "If yes, do you approve of this automated motivational model?",
          "Rate how you feel the Motivational section of the App will positively influence attitude to work",
          "Rate how you feel your management is willing to get involved with financing the Motivation result of the App",
          "How satisfied are you with the motivational grading of the App",
        ]}
        type="mixed"
        onChange={handleChange}
      />

      <SurveySection
        title="STRESS"
        questions={[
          "Rate how encompassing you feel the STRESS model reflects your stress level of activities in your organization",
          "How will you rate your Unit Head/H.O.D involvement in contributing to the stress being experienced in your department?",
          "Rate how fairly the STRESS Model reflects your department compared to others",
          "Rate the contributory role played by your management on the STRESS level in the organization",
          "How satisfied are you with the STRESS grade score given to your department",
        ]}
        type="scale"
        options={scaleOptions}
        onChange={handleChange}
      />

      <div className="mt-8">
        <button
          onClick={submitSurvey}
          disabled={submitting}
          className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Survey"}
        </button>
        {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
      </div>
    </main>
  );
}

function SurveySection({
  title,
  questions,
  type,
  options,
  onChange,
}: {
  title: string;
  questions: string[];
  type: "scale" | "yesno" | "mixed";
  options?: (string | number)[];
  onChange: (q: string, v: string) => void;
}) {
  return (
    <section className="bg-white p-6 my-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-indigo-700">{title}</h2>
      {questions.map((q, i) => (
        <div key={i} className="mb-4">
          <p className="font-medium mb-2">{q}</p>
          {type === "scale" && (
            <div className="flex gap-3">
              {options?.map((o) => (
                <label key={o} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={q}
                    value={o}
                    onChange={(e) => onChange(q, e.target.value)}
                  />
                  {o}
                </label>
              ))}
            </div>
          )}
          {type === "yesno" && (
            <div className="flex gap-3">
              {["Yes", "No"].map((o) => (
                <label key={o} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={q}
                    value={o}
                    onChange={(e) => onChange(q, e.target.value)}
                  />
                  {o}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
