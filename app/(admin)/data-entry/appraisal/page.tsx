"use client";
import { notify } from "@/lib/toast";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import Button from "@/app/components/ui/Button";
import PageHeader from "@/app/components/ui/PageHeader";
import { inputBase } from "@/app/components/ui/Input";


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
  const token = getAccessToken();
  const user = jwtDecode<JWTPayload>(token || "") || null;

  const [selectedStaff, setSelectedStaff] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);

  // Fetch employees
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/staff", {
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
      const appRes = await apiFetch(`/api/appraisal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesuser_name: staffName }),
      });
      const counterRes = await apiFetch(`/api/counter_appraisal`, {
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
      const res = await apiFetch("/api/acceptReject", {
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
      notify.success(data.message ||"Action completed");
      fetchScores(selectedStaff);
    } catch (err) {
      console.error("Error submitting decision:", err);
    }
  };

  const handlePrint = async () => {
    const element = document.getElementById("print-section");
    if (!element) return notify.error("Nothing to print!");

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`${selectedStaff}-appraisal.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Appraisal review & print"
        subtitle="Select a staff member to review staff vs. HOD scores and export the appraisal."
      />

      {/* Staff selection */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <select
          value={selectedStaff}
          onChange={(e) => {
            setSelectedStaff(e.target.value);
            fetchScores(e.target.value);
          }}
          aria-label="Select a staff member"
          className={`${inputBase} max-w-xs`}
        >
          <option value="">Select a staff member</option>
          {employees.map((emp, i) => (
            <option key={i} value={emp.name}>
              {emp.name}
            </option>
          ))}
        </select>

        {selectedStaff && (
          <Button onClick={handlePrint} variant="secondary">
            Print PDF
          </Button>
        )}
      </div>

      {loading ? (
        <div className="w-full h-40 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-pes border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        selectedStaff && (
          <div id="print-section" className="bg-surface border border-line rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-line">
              <h2 className="font-semibold text-strong">
                Appraisal for {selectedStaff}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-canvas text-left text-xs font-semibold text-muted uppercase tracking-wide">
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3">Staff score</th>
                    <th className="px-4 py-3">HOD score</th>
                    <th className="px-4 py-3">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
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
                      <tr key={i} className="align-middle">
                        <td className="px-4 py-3 capitalize text-body">{section.replace(/_/g, " ")}</td>
                        <td className="px-4 py-3 tabular-nums text-strong">{staffVal}</td>
                        <td className="px-4 py-3 tabular-nums text-strong">{hodVal}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleDecision(section, "accepted")}>
                              Accept
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDecision(section, "rejected")}>
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
