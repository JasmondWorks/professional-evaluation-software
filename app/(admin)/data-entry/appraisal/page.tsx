"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type JWTPayload = {
  name?: string;
  role?: string;
  org?: string;
};

export default function AppraisalStep() {
  const [staffScores, setStaffScores] = useState<any[]>([]);
  const [hodScores, setHodScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const session = searchParams.get("session") || "";
  const token = localStorage.getItem("access_token");
  const user = jwtDecode<JWTPayload>(token || "") || null;

  const [selectedStaff, setSelectedStaff] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);

  // Fetch employees
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ org: user?.org }),
        });
        if (res.ok) {
          const data = await res.json();
          setEmployees(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch staff:", err);
      }
    })();
  }, [user?.org]);

  // Fetch staff and HOD appraisal data
  const fetchScores = async (staffName: string) => {
    try {
      setLoading(true);
      const appRes = await fetch(`/api/appraisal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesuser_name: staffName }),
      });
      const counterRes = await fetch(`/api/counter_appraisal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesuser_name: staffName }),
      });

      const staffData = appRes.ok ? await appRes.json() : null;
      const hodData = counterRes.ok ? await counterRes.json() : null;

      // ✅ Safely handle empty or deleted counter data
      setStaffScores(staffData && staffData.length > 0 ? staffData : []);
      setHodScores(hodData && hodData.length > 0 ? hodData : []);
    } catch (err) {
      console.error("Error fetching scores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (section: string, decision: string) => {
    try {
      const res = await fetch("/api/acceptReject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          decision,
          staff: selectedStaff,
          user: user?.name,
        }),
      });
      const data = await res.json();
      alert(data.message || "Action completed");
      fetchScores(selectedStaff);
    } catch (err) {
      console.error("Error submitting decision:", err);
    }
  };

  const handlePrint = async () => {
    const element = document.getElementById("print-section");
    if (!element) return alert("Nothing to print!");

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`${selectedStaff}-appraisal.pdf`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Appraisal Review & Print</h1>

      {/* Staff selection */}
      <div className="mb-4 flex gap-4 items-center">
        <select
          value={selectedStaff}
          onChange={(e) => {
            setSelectedStaff(e.target.value);
            fetchScores(e.target.value);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">Select a staff</option>
          {employees.map((emp, i) => (
            <option key={i} value={emp.name}>
              {emp.name}
            </option>
          ))}
        </select>

        {selectedStaff && (
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Print PDF
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading appraisal data...</p>
      ) : (
        selectedStaff && (
          <div id="print-section" className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              Appraisal for: {selectedStaff}
            </h2>

            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border p-2">Section</th>
                  <th className="border p-2">Staff Score</th>
                  <th className="border p-2">HOD Score</th>
                  <th className="border p-2">Decision</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "teaching_quality_evaluation",
                  "research_quality_evaluation",
                  "administrative_quality_evaluation",
                  "community_quality_evaluation",
                  "other_relevant_information",
                ].map((section, i) => {
                  const staffVal = staffScores?.[0]?.[section] ?? "—";
                  const hodVal = hodScores?.[0]?.[section] ?? "—";
                  return (
                    <tr key={i}>
                      <td className="border p-2">{section.replace(/_/g, " ")}</td>
                      <td className="border p-2">{staffVal}</td>
                      <td className="border p-2">{hodVal}</td>
                      <td className="border p-2 flex gap-2">
                        <button
                          onClick={() => handleDecision(section, "accepted")}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecision(section, "rejected")}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
