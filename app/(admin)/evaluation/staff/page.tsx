"use client";
import { useState } from "react";
import number_of_staff from "@/app/api/modules/numberOfstaff/numberOfStaff";
import grand_total_man_hours from "@/app/api/modules/numberOfstaff/method1/main";
import { useAuth } from "@/app/components/useAuth";
import Button from "@/app/components/ui/Button";
import PageHeader from "@/app/components/ui/PageHeader";
import { inputBase } from "@/app/components/ui/Input";
import { Trash } from "iconsax-react";

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

const TASK_FIELDS: { key: keyof DataEntry; label: string }[] = [
  { key: "observed_time", label: "Observed time" },
  { key: "rating", label: "Observed rating (0 – 200)" },
  { key: "relaxation_time", label: "Relaxation time" },
  { key: "contingency_time", label: "Contingency allowance" },
  { key: "number_of_workers", label: "Number of workers" },
  { key: "annual_frequency", label: "Annual frequency" },
];

export default function Home() {
  const { role } = useAuth();
  const canEvaluate = role === "super-admin" || role === "admin";

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
    const parsed = parseInt(event.target.value);
    const value = Number.isNaN(parsed) ? 0 : parsed;
    setArrayDataEntry((prev) => ({
      ...prev,
      [data]: [
        ...prev[data].slice(0, index),
        value,
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
      setError("Available hours and Use factor must be greater than zero.");
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
    let evaluated = number_of_staff(
      grand_total,
      numberDataEntry.available_hours,
      numberDataEntry.use_factor,
    );
    setEvaluation(evaluated);
  }

  return (
    <form
      className="max-w-5xl mx-auto px-4 sm:px-6 py-6"
      onSubmit={(e) => e.preventDefault()}
    >
      <PageHeader
        title="Plain estimating data entry"
        subtitle="Enter observed task data to estimate the number of staff required."
      />

      {/* Tasks */}
      <div className="flex flex-col gap-4">
        {arrayDataEntry.observed_time.map((_, index) => (
          <div
            key={index}
            className="bg-surface border border-line rounded-xl shadow-card p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-strong">{`Task ${index + 1}`}</h2>
              {index > 0 && (
                <button
                  type="button"
                  onClick={(e) => handleTaskRemove(e, index)}
                  className="text-muted hover:text-danger-600 flex items-center gap-1.5 text-sm font-medium hover:bg-danger-50 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Trash size={16} />
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TASK_FIELDS.map(({ key, label }) => (
                <label key={key} className="flex flex-col">
                  <span className="text-sm font-medium text-body mb-1.5">
                    {label}
                  </span>
                  <input
                    required
                    className={inputBase}
                    type="number"
                    value={(arrayDataEntry[key][index] as number) || ""}
                    onChange={(e) => handleDataEntry(e, index, key)}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="secondary" size="sm" onClick={handleTaskAdd}>
          Add new task +
        </Button>
      </div>

      {/* Global parameters */}
      <div className="bg-surface border border-line rounded-xl shadow-card p-5 mt-6">
        <h2 className="font-semibold text-strong mb-4">Calculation parameters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <label className="flex flex-col">
            <span className="text-sm font-medium text-body mb-1.5">
              Available hours
            </span>
            <input
              name="available_hours"
              required
              className={inputBase}
              type="number"
              onChange={handleNumberDataEntry}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-medium text-body mb-1.5">
              Use factor
            </span>
            <input
              name="use_factor"
              required
              className={inputBase}
              type="number"
              onChange={handleNumberDataEntry}
            />
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 items-center mt-6">
        {canEvaluate ? (
          <Button type="submit" onClick={handleEvaluate}>
            Evaluate number of staff
          </Button>
        ) : (
          <p className="text-sm text-warning-700 bg-warning-50 px-3 py-2.5 rounded-lg border border-warning-100">
            Only administrators are authorized to calculate the final number of
            staff.
          </p>
        )}
        <Button href="/downloadables/relax.pdf" variant="secondary">
          Relaxation time guide
        </Button>
        <Button href="/downloadables/plain-estimate.pdf" variant="secondary">
          Print task form
        </Button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 text-sm text-danger-700 bg-danger-50 border border-danger-100 px-3 py-2.5 rounded-lg max-w-xl"
        >
          {error}
        </p>
      )}

      {canEvaluate && evaluation ? (
        <div className="mt-4 p-4 bg-success-50 border border-success-100 rounded-xl text-success-700 max-w-xl">
          <p className="text-sm">Number of staff required for this data</p>
          <p className="text-3xl font-semibold text-success-700 tabular-nums mt-1">
            {evaluation.toFixed(2)}
          </p>
        </div>
      ) : null}
    </form>
  );
}
