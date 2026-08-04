"use client";
import { notify } from "@/lib/toast";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import Button from "@/app/components/ui/Button";
import PageHeader from "@/app/components/ui/PageHeader";


interface JWTPayload {
  org: any;
  dept?: string | number;
}

interface EmployeeScores {
  pesuser_name: string;
  dept: string;
  appraisal?: Record<string, number>;
  performance?: Record<string, number>;
  stress?: Record<string, number>;
  counter_appraisal?: Record<string, number>;
  counter_performance?: Record<string, number>;
  // counter_stress?: Record<string, number>;
}

type GroupKey = "appraisal" | "performance" ;

export default function AuditorScoresPage() {
  const [scores, setScores] = useState<EmployeeScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedGroup, setSelectedGroup] = useState<GroupKey | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeScores | null>(null);
  const [auditorScores, setAuditorScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setError("No access token found");
      setLoading(false);
      return;
    }
    const decoded: JWTPayload = jwtDecode(token);
    const org = decoded.org;

    if (!org) {
      setError("No org found in token");
      setLoading(false);
      return;
    }

    apiFetch(`/api/getFlaggedScores?org=${org}`)
      .then((res) => res.json())
      .then((data) => {
        setScores(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch scores");
        setLoading(false);
      });
  }, []);

  function handleAuditorChange(metric: string, value: string) {
    const numValue = Number(value);
    setAuditorScores((prev) => ({ ...prev, [metric]: isNaN(numValue) ? 0 : numValue }));
  }

  const allInputsFilled = selectedEmployee
    ? Object.keys(selectedEmployee[selectedGroup as GroupKey] || {}).every(
        (metric) => auditorScores[metric] !== undefined && auditorScores[metric] !== null && auditorScores[metric] !== 0
      )
    : false;

  async function handleSubmit() {
    if (!selectedEmployee || !selectedGroup) return;

    if (!allInputsFilled) {
      notify.error("Please fill in all auditor resolution fields");
      return;
    }

    const decoded = jwtDecode<JWTPayload>(getAccessToken() || "");
    const org = decoded.org;

    const apiEndpoints: Record<GroupKey, string> = {
      appraisal: `/api/saveAuditorAppraisal`,
      performance: `/api/saveAuditorPerformance`,
      // stress: `/api/saveAuditorStress`,
    };

    const endpoint = apiEndpoints[selectedGroup];

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getAccessToken()}` },
        body: JSON.stringify({
          pesuser_name: selectedEmployee.pesuser_name,

          isAuditor: true,
          ...auditorScores,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed");

      notify.success("Auditor scores submitted successfully!");
      setAuditorScores({});
      setSelectedEmployee(null);
    } catch (err) {
      console.error("Error submitting auditor scores:", err);
      notify.error("Failed to submit auditor scores");
    }
  }

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pes border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="rounded-lg border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Auditor resolution"
        subtitle={
          !selectedGroup
            ? "Select a score group to resolve flagged submissions."
            : selectedEmployee
              ? `Resolving ${selectedEmployee.pesuser_name}`
              : `${selectedGroup} scores`
        }
        actions={
          selectedGroup && !selectedEmployee ? (
            <Button variant="secondary" size="sm" onClick={() => setSelectedGroup(null)}>
              ← Back
            </Button>
          ) : undefined
        }
      />

      {/* Step 1: Select Group */}
      {!selectedGroup && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["appraisal", "performance"] as GroupKey[]).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className="p-6 bg-surface border border-line hover:border-pes-200 hover:shadow-md rounded-xl shadow-card text-lg font-semibold text-strong capitalize text-left transition-[box-shadow,border-color] focus-visible:shadow-focus"
            >
              {g}
              <span className="block mt-1 text-sm font-normal text-muted">
                Resolve flagged {g} scores
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Select Employee */}
      {selectedGroup && !selectedEmployee && (
        <ul className="space-y-2.5">
          {scores?.map((emp) => {
            const groupScores = emp[selectedGroup];
            if (!groupScores) return null;
            return (
              <li
                key={emp.pesuser_name}
                className="flex justify-between items-center p-4 bg-surface border border-line rounded-lg shadow-card hover:border-pes-200 hover:shadow-md cursor-pointer transition-[box-shadow,border-color]"
                onClick={() => setSelectedEmployee(emp)}
              >
                <div>
                  <p className="font-semibold text-strong">{emp.pesuser_name}</p>
                  <p className="text-sm text-muted">{emp.dept}</p>
                </div>
                <span className="text-pes-600 font-medium text-sm">Resolve →</span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Step 3: Auditor Resolution */}
      {selectedGroup && selectedEmployee && (
        <div>
          <Button
            variant="secondary"
            size="sm"
            className="mb-5"
            onClick={() => setSelectedEmployee(null)}
          >
            ← Back to {selectedGroup} list
          </Button>

          <div className="bg-surface border border-line rounded-xl shadow-card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-muted uppercase tracking-wide bg-canvas px-4 py-3 border-b border-line">
              <span>Employee score</span>
              <span>HOD score</span>
              <span>Auditor resolution</span>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-line">
              {Object.entries(selectedEmployee[selectedGroup] || {}).map(([metric, empScore]) => {
                const counterKey = `counter_${selectedGroup}` as keyof EmployeeScores;
                const hodScore =
                  typeof selectedEmployee[counterKey] === "object" &&
                  selectedEmployee[counterKey] !== null &&
                  !Array.isArray(selectedEmployee[counterKey]) // Ensure it's not an array
                    ? (selectedEmployee[counterKey] as Record<string, number>)[metric]
                    : undefined;

                return (
                  <div
                    key={metric}
                    className="grid grid-cols-3 gap-3 items-center px-4 py-3"
                  >
                    {/* Employee score */}
                    <div>
                      <p className="font-medium text-strong capitalize">{metric.replace(/_/g, " ")}</p>
                      <p className="text-success-700 font-semibold tabular-nums">{empScore}</p>
                    </div>

                    {/* HOD score */}
                    <div>
                      {hodScore !== undefined ? (
                        <p className="text-pes-700 font-semibold tabular-nums">{hodScore}</p>
                      ) : (
                        <p className="text-muted italic">N/A</p>
                      )}
                    </div>

                    {/* Auditor input */}
                    <div>
                      <input
                        type="number"
                        aria-label={`Auditor resolution for ${metric.replace(/_/g, " ")}`}
                        className="w-24 h-10 px-3 rounded-lg bg-surface border border-line text-strong text-sm text-right tabular-nums focus:outline-none focus:border-pes-400 focus:shadow-focus"
                        value={auditorScores[metric] ?? ""}
                        onChange={(e) => handleAuditorChange(metric, e.target.value)}
                        placeholder="—"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button disabled={!allInputsFilled} onClick={handleSubmit}>
              Submit auditor scores
            </Button>
            {!allInputsFilled && (
              <p className="text-sm text-muted">
                Fill in every auditor resolution field to submit.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
