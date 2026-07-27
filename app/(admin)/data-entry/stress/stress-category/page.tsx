"use client";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { STRESS_INSTRUMENT, CategoryKey } from "@/app/lib/stress/instrument";
import { scoreItem } from "@/app/lib/stress/scoring";

type JWTPayload = {
  name?: string;
  role?: string;
  org?: string;
};

export default function StressForm5() {
  const [values, setValues] = useState<Record<string, number>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const handleChange = (key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

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
    try {
      const token = localStorage.getItem("access_token");
      const user: JWTPayload = jwtDecode(token || "");

      await fetch("/api/saveStressScores", {
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

      alert("Stress scores submitted successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Error submitting stress scores ❌");
    }
  };

  const currentCategory = STRESS_INSTRUMENT[currentStep];

  return (
    <div className="w-full p-12">
      <h1 className="text-2xl font-bold mb-6">
        Form 5: Setting the Stress Category/Staff
      </h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Step {currentStep + 1} of {STRESS_INSTRUMENT.length}: {currentCategory.label}
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
                      name={`${currentCategory.key}-${item.label}`}
                      value={i + 1}
                      checked={values[`${currentCategory.key}-${item.label}`] === i + 1}
                      onChange={(e) =>
                        handleChange(
                          `${currentCategory.key}-${item.label}`,
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

        {currentStep < STRESS_INSTRUMENT.length - 1 ? (
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
