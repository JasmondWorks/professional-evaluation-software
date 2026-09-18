"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from "@/lib/toast";
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
}

// Performance counter-scores are no longer entered here. The performance model
// requires a written reason with every objection, and this screen has nowhere to
// put one — a head could silently overwrite a score. Heads use
// /performance/review instead, which enforces the reason and runs the staff
// member's accept/reject step.
type GroupKey = "appraisal";

export default function EmployeeScoresPage() {
  const [scores, setScores] = useState<EmployeeScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<GroupKey | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeScores | null>(null);
  const [counterScores, setCounterScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setError("No access token found");
      setLoading(false);
      return;
    }
    const decoded: JWTPayload = jwtDecode(token);
    const dept = decoded.dept;
    if (!dept) {
      setError("No dept found in token");
      setLoading(false);
      return;
    }

    apiFetch(`/api/getAllDataScores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ dept }),
    })
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

  function handleCounterChange(metric: string, value: string) {
    // Guard against NaN writes: an empty or invalid field clears that metric
    // rather than storing NaN in the payload.
    const parsed = parseInt(value, 10);
    setCounterScores((prev) => {
      const next = { ...prev };
      if (Number.isNaN(parsed)) {
        delete next[metric];
      } else {
        next[metric] = parsed;
      }
      return next;
    });
  }

  async function handleSubmit() {
    if (!selectedEmployee || !selectedGroup) {
      notify.error("Select an employee and a score group first.");
      return;
    }

    const decoded = jwtDecode<JWTPayload>(getAccessToken() || "");
    const org = decoded.org;
    const dept = decoded.dept;

    const apiEndpoints: Record<GroupKey, string> = {
      appraisal: `/api/saveAppraisal`,
    };

    const endpoint = apiEndpoints[selectedGroup];
    setSubmitting(true);
    const toastId = notify.loading("Submitting HOD scores…");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: getAccessToken(),
          pesuser_name: selectedEmployee.pesuser_name,
          org,
          dept,
          isCounter: true,
          payload: counterScores,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed");

      notify.dismiss(toastId);
      notify.success("Counter scores submitted successfully.");
      setCounterScores({});
      setSelectedEmployee(null);
    } catch (err) {
      console.error("Error submitting counter scores:", err);
      notify.dismiss(toastId);
      notify.error(err instanceof Error ? err.message : "Failed to submit counter scores.");
    } finally {
      setSubmitting(false);
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
        title="Employee scores"
        subtitle={
          !selectedGroup
            ? "Select a score group to review your department's submissions."
            : selectedEmployee
              ? `Reviewing ${selectedEmployee.pesuser_name}`
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
          <a
            href="/performance/review"
            className="p-6 bg-surface border border-line hover:border-pes-200 hover:shadow-md rounded-xl shadow-card text-lg font-semibold text-strong text-left transition-[box-shadow,border-color] focus-visible:shadow-focus"
          >
            Performance
            <span className="block mt-1 text-sm font-normal text-muted">
              Review and object to performance scores, with a reason
            </span>
          </a>
          {(["appraisal"] as GroupKey[]).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className="p-6 bg-surface border border-line hover:border-pes-200 hover:shadow-md rounded-xl shadow-card text-lg font-semibold text-strong capitalize text-left transition-[box-shadow,border-color] focus-visible:shadow-focus"
            >
              {g}
              <span className="block mt-1 text-sm font-normal text-muted">
                Review and counter {g} scores
              </span>
            </button>
          ))}
        </div>
      )}

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
                <span className="text-pes-600 font-medium text-sm">View →</span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Step 3: View Employee Scores + Counter Inputs */}
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
          <div className="bg-surface border border-line rounded-xl shadow-card divide-y divide-line">
            {Object.entries(selectedEmployee[selectedGroup] || {}).map(
              ([metric, score]) => (
                <div
                  key={metric}
                  className="flex justify-between items-center gap-4 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-strong capitalize">
                      {metric.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-muted">
                      Employee score:{" "}
                      <span className="text-success-700 font-semibold tabular-nums">{score}</span>
                    </p>
                  </div>
                  <input
                    type="number"
                    aria-label={`HOD counter score for ${metric.replace(/_/g, " ")}`}
                    placeholder="—"
                    className="w-24 h-10 px-3 rounded-lg bg-surface border border-line text-strong text-sm text-right tabular-nums focus:outline-none focus:border-pes-400 focus:shadow-focus"
                    onChange={(e) => handleCounterChange(metric, e.target.value)}
                  />
                </div>
              )
            )}
          </div>
          <Button
            className="mt-6"
            onClick={handleSubmit}
            loading={submitting}
            disabled={submitting}
          >
            Submit HOD scores
          </Button>
        </div>
      )}
    </div>
  );
}
