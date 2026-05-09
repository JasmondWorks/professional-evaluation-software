"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

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

type GroupKey = "appraisal" | "performance" ;

export default function EmployeeScoresPage() {
  const [scores, setScores] = useState<EmployeeScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedGroup, setSelectedGroup] = useState<GroupKey | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeScores | null>(null);
  const [counterScores, setCounterScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No access token found");
      setLoading(false);
      return;
    }
    const decoded: JWTPayload = jwtDecode(token);
    const dept = decoded.dept;
    const org = decoded.org;
    if (!dept) {
      setError("No dept found in token");
      setLoading(false);
      return;
    }

    fetch(`/api/getAllDataScores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dept, org }),
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

  function handleCounterChange(metric: string, value: number) {
    setCounterScores((prev) => ({ ...prev, [metric]: value }));
  }

async function handleSubmit() {
  if (!selectedEmployee || !selectedGroup) {
    console.error("No employee or group selected");
    return;
  }

  const decoded = jwtDecode<JWTPayload>(localStorage.getItem('access_token') || "");
  const org = decoded.org
  const dept = decoded.dept

  console.log('counter scores are:', counterScores)

  const apiEndpoints: Record<GroupKey, string> = {
    appraisal: `/api/saveAppraisal`,
    performance: `/api/savePerformance`,
  };

  const endpoint = apiEndpoints[selectedGroup];
  console.log(selectedEmployee, org)
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pesuser_name: selectedEmployee.pesuser_name,
        org,
        dept,
        isCounter: true, // 👈 tell backend this is a counter-offer
        payload: counterScores, // all counter scores for that employee/group
      }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed");

    console.log("Counter scores submitted:", result);
    alert("Counter scores submitted successfully!");
    setCounterScores({});
    setSelectedEmployee(null);
  } catch (err) {
    console.error("Error submitting counter scores:", err);
    alert("Failed to submit counter scores");
  }
}


  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between">       
        <h1 className="text-xl font-bold mb-4">Employee Scores</h1>
        {
          selectedGroup && !selectedEmployee &&(
            <button
              onClick={() => setSelectedGroup(null)}
              className="mb-4 px-3 py-1 bg-gray-200 rounded"
            >
              ← Back
            </button>            
          )
        }
      </div>

      {/* Step 1: Select Group */}
      {!selectedGroup && (
        <div className="grid grid-cols-3 gap-4">
          {(["appraisal", "performance"] as GroupKey[]).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg shadow text-lg font-semibold capitalize"
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {selectedGroup && !selectedEmployee && (
        <div>
          <h2 className="text-lg font-semibold mb-4 capitalize">
            {selectedGroup} Scores
          </h2>
          <ul className="space-y-3">
            {scores?.map((emp) => {
              const groupScores = emp[selectedGroup];
              if (!groupScores) return null;
              return (
                <li
                  key={emp.pesuser_name}
                  className="flex justify-between items-center p-4 bg-white border rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <div>
                    <p className="font-semibold">{emp.pesuser_name}</p>
                    <p className="text-sm text-gray-500">{emp.dept}</p>
                  </div>
                  <span className="text-blue-600 font-medium">View →</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Step 3: View Employee Scores + Counter Inputs */}
      {selectedGroup && selectedEmployee && (
        <div>
          <button
            onClick={() => setSelectedEmployee(null)}
            className="mb-4 ms-auto px-3 py-1 bg-gray-200 rounded"
          >
            ← Back to {selectedGroup} list
          </button>
          <h2 className="text-lg font-semibold mb-4">
            {selectedEmployee.pesuser_name} ({selectedEmployee.dept})
          </h2>
          <div className="space-y-4">
            {Object.entries(selectedEmployee[selectedGroup] || {}).map(
              ([metric, score]) => (
                <div
                  key={metric}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium capitalize">
                      {metric.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-gray-500">
                      Employee Score: <span className="text-green-500 font-extrabold text-md">{score}</span>
                    </p>
                  </div>
                  <input
                    type="number"
                    className="border border-gray-400 rounded p-1 w-20 h-15 text-sm me-6"
                    onChange={(e) =>
                      handleCounterChange(metric, parseInt(e.target.value, 10))
                    }
                  />
                </div>
              )
            )}
          </div>
          <button
            onClick={handleSubmit}
            className="mt-6 px-4 py-2 bg-pes hover:bg-purple-900 text-white rounded shadow"
          >
            Submit HOD Scores
          </button>
        </div>
      )}
    </div>
  );
}
