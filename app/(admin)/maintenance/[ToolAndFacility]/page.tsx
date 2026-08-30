"use client";

import { useState } from "react";
import { ArrowLeft } from "iconsax-react";
import Link from "next/link";

interface HomeProps {
  params: {
    ToolAndFacility: string;
  };
}

export default function MaintenanceDetail({ params }: HomeProps) {
  const facilityName = decodeURIComponent(params.ToolAndFacility);

  // The client asked for every field on these sheets to carry data, so he can
  // see the maintenance model working end to end without first inventing a
  // machine's history. These are worked sample figures for one facility over a
  // year: 8,760 operating hours, six failures, and a maintenance plan against
  // them. They are ordinary editable values — typing over one replaces it — and
  // the banner says plainly that they are samples.
  const SAMPLE_DATA: Record<string, Record<string, number>> = {
    "Time taken to Failure": { totalTime: 8760, numFailures: 6 },
    "Maintenance Schedule Card": { plannedHours: 4, plannedFreq: 52 },
    "Job Report Card": { totalHours: 186, costPerHour: 4500 },
    "Weekly Maintenance Plan": { completed: 47, scheduled: 52 },
    "Job Specification Sheet": { stdHours: 3.5, actualJobHours: 4.2 },
    "Critical Examination Sheet": { reliability: 0.92, criticality: 1.4 },
    "History Record Card": { downtimeHours: 214, totalOperatingHours: 8760 },
  };

  const [formData, setFormData] = useState<Record<string, any>>(SAMPLE_DATA);
  const [usingSample, setUsingSample] = useState(true);
  const [results, setResults] = useState<Record<string, number>>({});

  const handleChange = (sheet: string, field: string, value: string) => {
    setUsingSample(false);
    setFormData((prev) => ({
      ...prev,
      [sheet]: { ...prev[sheet], [field]: parseFloat(value) || 0 },
    }));
  };

  const clearAll = () => {
    setUsingSample(false);
    setFormData({});
    setResults({});
  };

  const calculateModel = () => {
    const timeToFailure = formData["Time taken to Failure"]?.totalTime || 0;
    const numFailures = formData["Time taken to Failure"]?.numFailures || 0;
    const reliability =
      formData["Critical Examination Sheet"]?.reliability || 0;
    const criticality =
      formData["Critical Examination Sheet"]?.criticality || 1;
    const totalHours = formData["Job Report Card"]?.totalHours || 0;
    const costPerHour = formData["Job Report Card"]?.costPerHour || 0;
    const plannedHours =
      formData["Maintenance Schedule Card"]?.plannedHours || 0;
    const plannedFreq = formData["Maintenance Schedule Card"]?.plannedFreq || 0;
    const completedTasks = formData["Weekly Maintenance Plan"]?.completed || 0;
    const scheduledTasks = formData["Weekly Maintenance Plan"]?.scheduled || 0;
    const stdHours = formData["Job Specification Sheet"]?.stdHours || 0;
    const actualJobHours =
      formData["Job Specification Sheet"]?.actualJobHours || 0;
    const downtimeHours = formData["History Record Card"]?.downtimeHours || 0;
    const totalOperatingHours =
      formData["History Record Card"]?.totalOperatingHours || 0;

    // Calculations from PDF
    const mtbf = numFailures > 0 ? timeToFailure / numFailures : 0;
    const interval =
      mtbf && criticality ? (mtbf * reliability) / criticality : 0;
    const cost = totalHours * costPerHour;
    const totalPlannedHours = plannedHours * plannedFreq;
    const compliance =
      scheduledTasks > 0 ? (completedTasks / scheduledTasks) * 100 : 0;
    const variance = actualJobHours - stdHours;
    const downtimePercent =
      totalOperatingHours > 0 ? (downtimeHours / totalOperatingHours) * 100 : 0;

    setResults({
      mtbf,
      interval,
      cost,
      totalPlannedHours,
      compliance,
      variance,
      downtimePercent,
    });
  };

  const sheets = [
    { name: "Time taken to Failure", fields: ["totalTime", "numFailures"] },
    { name: "General Facility Register", fields: [] },
    {
      name: "Maintenance Schedule Card",
      fields: ["plannedHours", "plannedFreq"],
    },
    { name: "Job Report Card", fields: ["totalHours", "costPerHour"] },
    { name: "Machine Register Card", fields: [] },
    { name: "Weekly Maintenance Plan", fields: ["completed", "scheduled"] },
    { name: "Job Specification Sheet", fields: ["stdHours", "actualJobHours"] },
    {
      name: "Critical Examination Sheet",
      fields: ["reliability", "criticality"],
    },
    {
      name: "History Record Card",
      fields: ["downtimeHours", "totalOperatingHours"],
    },
  ];

  return (
    <div className="min-h-screen w-full bg-canvas flex justify-center items-center">
      <div className="bg-white shadow-md rounded-lg w-[95%]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            <Link href="/maintenance">
              <ArrowLeft className="me-4" />
            </Link>
            <h1 className="text-xl font-semibold">{facilityName}</h1>
          </div>
        </div>

        {usingSample && (
          <div className="mx-4 mt-4 flex items-center justify-between gap-4 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3">
            <p className="text-sm text-warning-700">
              These sheets are filled with <strong>sample figures</strong> — one facility
              over a year of 8,760 operating hours — so the model can be seen working.
              Type over any field to use your own, or clear them all.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="shrink-0 rounded-md border border-warning-200 px-3 py-1.5 text-xs font-medium text-warning-700 hover:bg-warning-100"
            >
              Clear sheets
            </button>
          </div>
        )}

        {/* Forms */}
        <div className="p-4">
          {sheets.map((sheet, index) => (
            <div key={index} className="mb-4 border rounded">
              <details className="p-3" open={false}>
                <summary className="cursor-pointer font-medium">
                  {sheet.name}
                </summary>
                {sheet.fields.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {sheet.fields.map((field) => (
                      <div key={field}>
                        <label className="block text-sm capitalize">
                          {field}
                        </label>
                        <input
                          type="number"
                          className="border rounded p-2 w-full"
                          value={formData[sheet.name]?.[field] ?? ""}
                          onChange={(e) =>
                            handleChange(sheet.name, field, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mt-2">
                    No direct inputs required for calculations.
                  </p>
                )}
              </details>
            </div>
          ))}
        </div>

        <button
          onClick={calculateModel}
          className="flex items-center bg-pes text-white px-4 py-2  m-4 rounded"
        >
          Conduct P.M Model
        </button>

        {/* Results */}
        {Object.keys(results).length > 0 && (
          <div className="p-4 border-t bg-canvas">
            <h2 className="font-semibold mb-2">Results:</h2>
            <p>MTBF: {results.mtbf?.toFixed(2)} hours</p>
            <p>
              Optimal Maintenance Interval: {results.interval?.toFixed(2)} hours
            </p>
            <p>Total Maintenance Cost: ₦{results.cost?.toFixed(2)}</p>
            <p>
              Planned Maintenance Hours: {results.totalPlannedHours?.toFixed(2)}{" "}
              hrs
            </p>
            <p>Weekly Compliance: {results.compliance?.toFixed(2)}%</p>
            <p>Job Variance: {results.variance?.toFixed(2)} hrs</p>
            <p>Downtime: {results.downtimePercent?.toFixed(2)}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
