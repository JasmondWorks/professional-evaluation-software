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
  S0: number;
  studentPopulation: number;
  staffMix: {
    lecturers: number;
    seniorLecturers: number;
    professors: number;
  };
};

interface Props {
  params: Params;
  setParams: React.Dispatch<React.SetStateAction<Params>>;
}

export default function ParametersForm({ params, setParams }: Props) {
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-xl shadow mb-8">
      <h2 className="col-span-full text-lg font-semibold mb-2 text-gray-800">
        Model Parameters
      </h2>

      {Object.entries(params)
        .filter(([key]) => key !== "staffMix")
        .map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label htmlFor={key} className="text-sm font-medium text-gray-600">
              {key}
            </label>
            <input
              type="number"
              step="any"
              id={key}
              name={key}
              value={String(value)}
              onChange={handleChange}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        ))}

      <h3 className="col-span-full text-md font-semibold mt-4 text-gray-700">
        Staff Mix
      </h3>

      {Object.entries(params.staffMix).map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <label htmlFor={key} className="text-sm font-medium text-gray-600">
            {key}
          </label>
          <input
            type="number"
            step="any"
            id={key}
            name={key}
            value={value}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      ))}
    </div>
  );
}
