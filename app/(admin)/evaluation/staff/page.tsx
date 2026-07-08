"use client";
import { useEffect, useRef, useState } from "react";
import number_of_staff from "@/app/api/modules/numberOfstaff/numberOfStaff";
import grand_total_man_hours from "@/app/api/modules/numberOfstaff/method1/main";
import LoadingButton from "../../../components/ui/LoadingButton";
import { useAuth } from "@/app/components/useAuth";
import Link from "next/link";

type DataEntry = {
  observed_time: number[];
  rating: number[];
  estimated_time: number[];
  relaxation_time: number[];
  contingency_time: number[];
  number_of_workers: number[];
  annual_frequency: number[];
};

type numberDataEntry = {
  available_hours: number;
  use_factor: number;
};

export default function Home() {
  const { role } = useAuth();

  const [arrayDataEntry, setArrayDataEntry] = useState<DataEntry>({
    observed_time: [0],
    rating: [0],
    estimated_time: [0],
    relaxation_time: [0],
    contingency_time: [0],
    number_of_workers: [0],
    annual_frequency: [0],
  });
  const [numberDataEntry, setNumberDataEntry] = useState<numberDataEntry>({
    available_hours: 0,
    use_factor: 0,
  });
  const [evaluation, setEvaluation] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleDataEntry<K extends keyof DataEntry>(
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
    data: K,
  ) {
    event.preventDefault();
    setArrayDataEntry((prev) => ({
      ...prev,
      [data]: [
        ...prev[data].slice(0, index),
        parseInt(event.target.value),
        ...prev[data].slice(index + 1),
      ],
    }));
  }

  function handleNumberDataEntry(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    setNumberDataEntry((prev) => ({
      ...prev,
      [event.target.name]: Number(event.target.value),
    }));
  }

  function handleTaskAdd(event: React.MouseEvent) {
    event.preventDefault();
    setArrayDataEntry((prev) => ({
      observed_time: [...prev.observed_time, 0],
      rating: [...prev.rating, 0],
      estimated_time: [...prev.estimated_time, 0],
      relaxation_time: [...prev.relaxation_time, 0],
      contingency_time: [...prev.contingency_time, 0],
      number_of_workers: [...prev.number_of_workers, 0],
      annual_frequency: [...prev.annual_frequency, 0],
    }));
  }

  function handleTaskRemove(event: React.MouseEvent, index: number) {
    event.preventDefault();
    setArrayDataEntry((prev) => ({
      observed_time: prev.observed_time.filter((_, i) => i !== index),
      rating: prev.rating.filter((_, i) => i !== index),
      estimated_time: prev.estimated_time.filter((_, i) => i !== index),
      relaxation_time: prev.relaxation_time.filter((_, i) => i !== index),
      contingency_time: prev.contingency_time.filter((_, i) => i !== index),
      number_of_workers: prev.number_of_workers.filter((_, i) => i !== index),
      annual_frequency: prev.annual_frequency.filter((_, i) => i !== index),
    }));
  }

  function handleEvaluate(event: { preventDefault: () => void }) {
    event.preventDefault();
    setError(null);

    // Validation
    if (
      numberDataEntry.available_hours <= 0 ||
      numberDataEntry.use_factor <= 0
    ) {
      setError("⚠️ Available hours and Use factor must be greater than zero.");
      return;
    }

    let grand_total = grand_total_man_hours(
      arrayDataEntry.observed_time,
      arrayDataEntry.rating,
      arrayDataEntry.relaxation_time,
      arrayDataEntry.contingency_time,
      arrayDataEntry.number_of_workers,
      arrayDataEntry.annual_frequency,
    );
    console.log(grand_total);
    let evaluated = number_of_staff(
      grand_total,
      numberDataEntry.available_hours,
      numberDataEntry.use_factor,
    );
    console.log(`the evaluated number of staff is ${evaluated}`);
    setEvaluation(evaluated);
  }

  return (
    <form className="flex flex-col m-4" onSubmit={() => {}}>
      <div className="p-2">
        <h1 className="font-bold text-3xl my-6">Plain estimating data entry</h1>

        <div>
          {arrayDataEntry.observed_time.map((_, index) => (
            <div
              key={index}
              className="flex flex-col border-b border-gray-100 pb-8 mb-8 last:border-0 last:pb-0"
            >
              <div className="flex justify-between items-center mb-4">
                <h1 className="font-bold text-lg text-gray-700">{`Task ${index + 1}`}</h1>
                {index > 0 && (
                  <button
                    onClick={(e) => handleTaskRemove(e, index)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1.5 text-sm font-semibold transition-all hover:bg-red-50 px-3 py-1.5 rounded-lg"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-y-4">
                <label className="flex flex-col w-72">
                  <span className="text-sm font-medium text-gray-600 mb-1">
                    Observed time
                  </span>
                  <input
                    required
                    className="border border-gray-300 me-6 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    type="number"
                    value={arrayDataEntry.observed_time[index] || ""}
                    onChange={(e) => handleDataEntry(e, index, "observed_time")}
                  />
                </label>

                <label className="flex flex-col w-72">
                  <span className="text-sm font-medium text-gray-600 mb-1">
                    Observed rating (0 - 200)
                  </span>
                  <input
                    required
                    className="border border-gray-300 me-6 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    type="number"
                    value={arrayDataEntry.rating[index] || ""}
                    onChange={(e) => handleDataEntry(e, index, "rating")}
                  />
                </label>

                <label className="flex flex-col w-72">
                  <span className="text-sm font-medium text-gray-600 mb-1">
                    Relaxation time
                  </span>
                  <input
                    required
                    className="border border-gray-300 me-6 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    type="number"
                    value={arrayDataEntry.relaxation_time[index] || ""}
                    onChange={(e) =>
                      handleDataEntry(e, index, "relaxation_time")
                    }
                  />
                </label>

                <label className="flex flex-col w-72">
                  <span className="text-sm font-medium text-gray-600 mb-1">
                    Contingency allowance
                  </span>
                  <input
                    required
                    className="border border-gray-300 me-6 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    type="number"
                    value={arrayDataEntry.contingency_time[index] || ""}
                    onChange={(e) =>
                      handleDataEntry(e, index, "contingency_time")
                    }
                  />
                </label>

                <label className="flex flex-col w-72">
                  <span className="text-sm font-medium text-gray-600 mb-1">
                    Number of workers
                  </span>
                  <input
                    required
                    className="border border-gray-300 me-6 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    type="number"
                    value={arrayDataEntry.number_of_workers[index] || ""}
                    onChange={(e) =>
                      handleDataEntry(e, index, "number_of_workers")
                    }
                  />
                </label>

                <label className="flex flex-col w-72">
                  <span className="text-sm font-medium text-gray-600 mb-1">
                    Annual frequency
                  </span>
                  <input
                    required
                    className="border border-gray-300 me-6 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    type="number"
                    value={arrayDataEntry.annual_frequency[index] || ""}
                    onChange={(e) =>
                      handleDataEntry(e, index, "annual_frequency")
                    }
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <hr className="border-dashed border-2 my-6" />

        <label htmlFor="" className="flex flex-col w-72">
          Available hours
          <input
            name="available_hours"
            required
            className="border me-6 my-2 px-16 py-2 rounded"
            type="number"
            onChange={handleNumberDataEntry}
          />
        </label>

        <label htmlFor="" className="flex flex-col w-72">
          Use factor
          <input
            name="use_factor"
            required
            className="border me-6 my-2 px-16 py-2 rounded"
            type="number"
            onChange={handleNumberDataEntry}
          />
        </label>
      </div>

      <div className="flex flex-wrap my-4 items-center">
        {role === "super-admin" || role === "admin" ? (
          <LoadingButton
            className="bg-pes w-fit my-3 me-2 rounded text-white px-16 py-3"
            type="submit"
            onClick={handleEvaluate}
          >
            Evaluate number of staff
          </LoadingButton>
        ) : (
          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 my-3 me-2">
            Only administrators are authorized to calculate the final number of
            staff.
          </p>
        )}
        <Link
          href="/downloadables/relax.pdf"
          className="bg-pes w-fit my-3 me-2 rounded text-white px-16 py-3"
        >
          Relaxation time guide
        </Link>
        <Link
          href="/downloadables/plain-estimate.pdf"
          className="bg-pes w-fit my-3 me-2 rounded text-white px-16 py-3"
        >
          Print task form
        </Link>
        <LoadingButton
          className="bg-pes w-fit my-3 me-2 rounded text-white px-16 py-3"
          onClick={handleTaskAdd}
        >
          Add new task +
        </LoadingButton>
        {error && (
          <p className="text-red-500 text-sm font-medium animate-pulse ms-2">
            {error}
          </p>
        )}
      </div>
      <>
        {(role === "super-admin" || role === "admin") && evaluation ? (
          <p className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 font-semibold text-lg max-w-xl shadow-sm">
            The number of staff required for the following information is{" "}
            <span className="text-xl font-bold text-pes underline">
              {evaluation.toFixed(2)}
            </span>
          </p>
        ) : (
          <></>
        )}
      </>
    </form>
  );
}
