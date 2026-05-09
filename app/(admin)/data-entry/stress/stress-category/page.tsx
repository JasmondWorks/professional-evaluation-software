"use client";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";

type JWTPayload = {
  name?: string;
  role?: string;
  org?: string;
};

type StressItem = {
  label: string;
  weight: number;
};

type StressCategory = {
  category: string;
  items: StressItem[];
};

const stressData: StressCategory[] = [
  {
    category: "Organizational",
    items: [
      { label: "Time", weight: 116 },
      { label: "Paper Work", weight: 99 },
      { label: "Lack of Materials", weight: 34 },
      { label: "Extra Duties", weight: 32 },
      { label: "Physical Plant", weight: 19 },
      { label: "Meetings", weight: 15 },
      { label: "Class Size", weight: 15 },
      { label: "Poor Scheduling", weight: 13 },
      { label: "Interruptions", weight: 13 },
      { label: "Travels", weight: 12 },
      { label: "Conflicting demand", weight: 11 },
      { label: "Athletics", weight: 4 },
    ],
  },
  {
    category: "Student",
    items: [
      { label: "Student Discipline", weight: 97 },
      { label: "Student Apathy", weight: 38 },
      { label: "Low Student Achievement", weight: 37 },
      { label: "Student Absences", weight: 3 },
    ],
  },
  {
    category: "Administrative",
    items: [
      { label: "Unclear Expectations", weight: 27 },
      { label: "Lack of Knowledge or Expertise", weight: 25 },
      { label: "Lack of Support (Backing, Recognition)", weight: 24 },
      { label: "Inconsistency", weight: 17 },
      { label: "Unreasonable Expectations", weight: 14 },
      { label: "Poor Evaluation Procedures", weight: 12 },
      { label: "Indecisiveness", weight: 10 },
      { label: "Lack of Opportunities for Input", weight: 10 },
      { label: "Failure to Provide Resources", weight: 7 },
      { label: "Lack of Follow-Through", weight: 6 },
      { label: "Harassment", weight: 5 },
      { label: "Favoritism", weight: 5 },
      { label: "Miscellaneous", weight: 4 },
    ],
  },
  {
    category: "Teacher",
    items: [
      { label: "Conflict or Lack of Cooperation", weight: 59 },
      { label: "Incompetence or Irresponsibility", weight: 21 },
      { label: "Negative Attitude", weight: 7 },
      { label: "Lack of Communication", weight: 5 },
    ],
  },
  {
    category: "Parents",
    items: [
      { label: "Interference", weight: 24 },
      { label: "Nonsupport or Apathy", weight: 15 },
      { label: "Lack of Communication & Understanding", weight: 11 },
    ],
  },
  {
    category: "Occupational",
    items: [
      { label: "Lack of Professional Growth", weight: 12 },
      { label: "Low Salary", weight: 9 },
      { label: "Lack of Advancement", weight: 5 },
      { label: "Job Insecurity", weight: 4 },
    ],
  },
  {
    category: "Personal",
    items: [
      { label: "Professional/Personal Conflict", weight: 12 },
      { label: "Conflict With Personal Values", weight: 10 },
      { label: "Miscellaneous", weight: 4 },
    ],
  },
  {
    category: "Academic Program",
    items: [
      { label: "Repetition", weight: 7 },
      { label: "Unrealistic Goals", weight: 7 },
      { label: "Low Standards", weight: 5 },
      { label: "Responsibility to Grade Students", weight: 4 },
    ],
  },
  {
    category: "Negative Public Attitude",
    items: [{ label: "Negative Public Attitude", weight: 9 }],
  },
  {
    category: "Miscellaneous",
    items: [{ label: "Miscellaneous", weight: 27 }],
  },
];

export default function StressForm5() {
  const [values, setValues] = useState<Record<string, number>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const handleChange = (key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  // compute totals
  const categoryTotals: Record<string, number> = {};
  stressData.forEach((group) => {
    let subtotal = 0;
    group.items.forEach((item) => {
      const val = values[`${group.category}-${item.label}`] || 0;
      subtotal += (val * item.weight) / 10;
    });
    categoryTotals[group.category] = subtotal;
  });

  const scores = {
    organizational: categoryTotals["Organizational"] || 0,
    student: categoryTotals["Student"] || 0,
    administrative: categoryTotals["Administrative"] || 0,
    teacher: categoryTotals["Teacher"] || 0,
    parents: categoryTotals["Parents"] || 0,
    occupational: categoryTotals["Occupational"] || 0,
    personal: categoryTotals["Personal"] || 0,
    academic_program: categoryTotals["Academic Program"] || 0,
    negative_public_attitude: categoryTotals["Negative Public Attitude"] || 0,
    misc: categoryTotals["Miscellaneous"] || 0,
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const user: JWTPayload = jwtDecode(token || "");

      await fetch("/api/saveStressScores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: user.name,
          org: user.org,
          scores,
        }),
      });

      alert("Stress scores submitted successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Error submitting stress scores ❌");
    }
  };

  const currentCategory = stressData[currentStep];

  return (
    <div className="w-full p-12">
      <h1 className="text-2xl font-bold mb-6">
        Form 5: Setting the Stress Category/Staff
      </h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Step {currentStep + 1} of {stressData.length}: {currentCategory.category}
        </h2>
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
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
                  <td key={i} className="border px-2 py-1 text-center">
                    <input
                      type="radio"
                      name={`${currentCategory.category}-${item.label}`}
                      value={i + 1}
                      checked={values[`${currentCategory.category}-${item.label}`] === i + 1}
                      onChange={(e) =>
                        handleChange(
                          `${currentCategory.category}-${item.label}`,
                          parseInt(e.target.value)
                        )
                      }
                    />
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
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        )}

        {currentStep < stressData.length - 1 ? (
          <button
            onClick={() => setCurrentStep((prev) => prev + 1)}
            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="ml-auto bg-pes text-white px-4 py-2 rounded"
          >
            Submit Totals
          </button>
        )}
      </div>
    </div>
  );
}
