"use client";

import React from "react";

type Params = {
  D: number;
  G: number;
  Y: number;
  alpha: number;
  t1: number;
  t2: number;
  t3: number;
  t4: number;
  studentPopulation: number;
  staffMix: {
    lecturers: number;
    seniorLecturers: number;
    professors: number;
  };
};

// Human-readable labels for parameter keys
const paramLabels: Record<string, string> = {
  D: "D — Official weekly hours",
  G: "G — Total hours in a week",
  Y: "y — Lecture hours per course",
  alpha: "a — Courses per week",
  t1: "t₁ — Consultation proportion",
  t2: "t₂ — Research proportion",
  t3: "t₃ — Assessment proportion",
  t4: "t₄ — Assessment hours per student",
  studentPopulation: "Student population",
};

interface Props {
  params: Params;
  setParams: React.Dispatch<React.SetStateAction<Params>>;
  mode?: "ordinary" | "robust";
}

export default function ParametersForm({ params, setParams, mode }: Props) {
  // G is only used in the Robust model; hide it for Ordinary
  const hiddenKeys = mode === "ordinary" ? ["G", "staffMix"] : ["staffMix"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value);

    if (["lecturers", "seniorLecturers", "professors"].includes(name)) {
      setParams((prev) => ({
        ...prev,
        staffMix: { ...prev.staffMix, [name]: numericValue },
      }));
    } else {
      setParams((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-canvas p-6 rounded-xl shadow mb-8">
      <h2 className="col-span-full text-lg font-semibold mb-2 text-strong">
        Model Parameters
      </h2>

      {Object.entries(params)
        .filter(([key]) => !hiddenKeys.includes(key))
        .map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label htmlFor={key} className="text-sm font-medium text-body">
              {paramLabels[key] || key}
            </label>
            <input
              type="number"
              step="any"
              id={key}
              name={key}
              value={String(value)}
              onChange={handleChange}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-pes focus:outline-none"
            />
          </div>
        ))}

      <h3 className="col-span-full text-md font-semibold mt-4 text-body">
        Staff Mix
      </h3>

      {Object.entries(params.staffMix).map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <label htmlFor={key} className="text-sm font-medium text-body">
            {key}
          </label>
          <input
            type="number"
            step="any"
            id={key}
            name={key}
            value={value}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-pes focus:outline-none"
          />
        </div>
      ))}
    </div>
  );
}
