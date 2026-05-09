"use client";
import { useState } from "react";

export default function AuditorSurveyPage() {
  const [formData, setFormData] = useState({});

  const handleChange = (section: string, question: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [question]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Survey submitted:", formData);
    alert("Thank you for completing the survey!");
  };

  const renderRating = (section: string, question: string) => (
    <div className="flex space-x-2 mt-2">
      {[0, 1, 2, 3, 4, 5].map((num) => (
        <label key={num} className="flex items-center space-x-1">
          <input
            type="radio"
            name={`${section}-${question}`}
            value={num}
            onChange={(e) => handleChange(section, question, e.target.value)}
          />
          <span>{num}</span>
        </label>
      ))}
    </div>
  );

  const renderYesNo = (section: string, question: string) => (
    <div className="flex space-x-4 mt-2">
      {["Yes", "No"].map((opt) => (
        <label key={opt} className="flex items-center space-x-1">
          <input
            type="radio"
            name={`${section}-${question}`}
            value={opt}
            onChange={(e) => handleChange(section, question, e.target.value)}
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );

  return (
    <main className="w-full bg-gray-50 min-h-screen py-10 px-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Auditor Survey</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-8 space-y-8"
      >
        {/* --- APP USE --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-blue-600">App Use</h2>
          <div className="space-y-6">
            <div>
              <p>1. Rate how you feel is staff experience on ease of use of the App</p>
              {renderRating("app_use", "ease_of_use")}
            </div>
            <div>
              <p>2. Was there any occasion where you had to review any staff result(s)?</p>
              {renderYesNo("app_use", "review_results")}
            </div>
            <div>
              <p>3. Do you agree with the results displayed at the different departments?</p>
              {renderYesNo("app_use", "agree_results")}
            </div>
            <div>
              <p>4. Will you request more time before final closure of actions?</p>
              {renderYesNo("app_use", "request_more_time")}
            </div>
            <div>
              <p>5. Are the texts displayed by the App legible enough?</p>
              {renderYesNo("app_use", "text_legible")}
            </div>
          </div>
        </section>

        {/* --- STRESS OBSERVATION --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-red-600">Stress Observation</h2>
          <div className="space-y-6">
            <div>
              <p>1. Rate how you feel the stress level at various departments fairs.</p>
              {renderRating("stress", "department_stress")}
            </div>
            <div>
              <p>2. Is this stress level acceptable as displayed by the model?</p>
              {renderYesNo("stress", "stress_accepted")}
            </div>
            <div>
              <p>3. Rate stress level due to staff not allowed on Annual Leave.</p>
              {renderRating("stress", "no_annual_leave")}
            </div>
            <div>
              <p>4. Rate influence of stress on decision not to go on leave.</p>
              {renderRating("stress", "influence_leave_decision")}
            </div>
            <div>
              <p>5. Rate HOD’s influence on observed stress levels.</p>
              {renderRating("stress", "hod_influence")}
            </div>
          </div>
        </section>

        {/* --- MOTIVATION --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-green-600">Motivation</h2>
          <div className="space-y-6">
            <div>
              <p>1. Was the motivation model applied in appraisal/performance activities?</p>
              {renderYesNo("motivation", "model_applied")}
            </div>
            <div>
              <p>2. Was the model influenced by Unit Head/HOD?</p>
              {renderYesNo("motivation", "hod_influence")}
            </div>
            <div>
              <p>3. Rate if motivation section will improve staff attitude to work.</p>
              {renderRating("motivation", "motivation_influence")}
            </div>
            <div>
              <p>4. Rate management willingness to fund motivational results.</p>
              {renderRating("motivation", "management_commitment")}
            </div>
            <div>
              <p>5. Rate your satisfaction with motivational grading.</p>
              {renderRating("motivation", "satisfaction")}
            </div>
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Submit Survey
        </button>
      </form>
    </main>
  );
}
