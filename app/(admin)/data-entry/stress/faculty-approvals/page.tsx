"use client";

// Faculty/Division head approvals: sign off the departments in your unit for the
// current cycle. Labels adapt to the org's sector (Faculty/Dean vs
// Division/Division Head).

import { useCallback, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { notify } from "@/lib/toast";
import { orgTerms } from "@/app/lib/orgTerms";
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';

type DeptRow = {
  dept: string;
  staff: number;
  submitted: number;
  hodApproved: number;
  approved: number;
  pendingHod: number;
  pendingApproval: number;
  readyForFaculty: boolean;
  cleared: boolean;
};
type Status = {
  active: boolean;
  faculty?: string;
  counts?: {
    staff: number;
    submitted: number;
    hodApproved: number;
    approved: number;
    pendingHod: number;
    pendingApproval: number;
    allHodApproved: boolean;
  };
  departments?: DeptRow[];
};

export default function FacultyApprovals() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const terms = useMemo(() => {
    if (typeof window === "undefined") return orgTerms();
    const token = getAccessToken();
    try {
      const d: any = token ? jwtDecode(token) : {};
      return orgTerms(d?.productCategory ?? d?.category);
    } catch {
      return orgTerms();
    }
  }, []);

  const load = useCallback(async () => {
    const token = getAccessToken();
    try {
      const res = await apiFetch("/api/stress/faculty-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus(await res.json());
    } catch {
      setStatus({ active: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (dept?: string) => {
    setWorking(true);
    const toastId = notify.loading("Approving…");
    try {
      const token = getAccessToken();
      const res = await apiFetch("/api/stress/faculty-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(dept ? { dept } : {}),
      });
      const data = await res.json();
      notify.dismiss(toastId);
      if (!res.ok) throw new Error(data.error || "Failed to approve");
      notify.success(data.message || "Approved");
      await load();
    } catch (e) {
      notify.dismiss(toastId);
      notify.error(e instanceof Error ? e.message : "Failed to approve");
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-12 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pes mt-16" />
      </div>
    );
  }

  if (!status?.active) {
    return (
      <div className="w-full p-12 text-center text-gray-500 mt-10">
        No stress exercise is currently open for your {terms.unit.toLowerCase()}.
      </div>
    );
  }

  const c = status.counts!;

  return (
    <div className="w-full p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">
        {terms.unit} Approvals — {status.faculty}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        As {terms.head}, verify and approve the departments in your {terms.unit.toLowerCase()} for the current cycle.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Staff", value: c.staff },
          { label: "Submitted", value: c.submitted },
          { label: "Awaiting HOD", value: c.pendingHod },
          { label: `Awaiting ${terms.head}`, value: c.pendingApproval },
          { label: "Approved", value: c.approved },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-gray-400">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-end gap-2 mb-3">
        <button
          onClick={() => approve()}
          disabled={working || c.pendingApproval === 0 || !c.allHodApproved}
          className="bg-pes text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Approve entire {terms.unit.toLowerCase()} ({c.pendingApproval})
        </button>
        {/* Never a bare disabled button — say why it's disabled (see AGENTS.md). */}
        {(c.pendingApproval === 0 || !c.allHodApproved) && (
          <div className="w-full sm:max-w-md text-sm rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600">
            {c.submitted === 0
              ? `Nothing to approve yet — no staff in your ${terms.unit.toLowerCase()} have submitted their theme & feeling form for this cycle.`
              : !c.allHodApproved
                ? `You can approve the whole ${terms.unit.toLowerCase()} once every department has been approved by its HOD first. ${c.pendingHod} submission(s) are still awaiting their HOD.`
                : `All submitted responses in your ${terms.unit.toLowerCase()} have already been approved. There's nothing left for you to approve.`}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b text-gray-700">
            <tr>
              <th className="px-6 py-3 font-semibold">Department</th>
              <th className="px-6 py-3 font-semibold text-right">Staff</th>
              <th className="px-6 py-3 font-semibold text-right">Submitted</th>
              <th className="px-6 py-3 font-semibold text-right">Approved</th>
              <th className="px-6 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {status.departments!.map((d) => (
              <tr key={d.dept} className="hover:bg-gray-50/50">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {d.dept}
                  {d.cleared && (
                    <span className="ml-2 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">Cleared</span>
                  )}
                </td>
                <td className="px-6 py-3 text-right text-gray-600">{d.staff}</td>
                <td className="px-6 py-3 text-right text-gray-600">{d.submitted}</td>
                <td className="px-6 py-3 text-right text-gray-600">{d.approved}</td>
                <td className="px-6 py-3 text-right">
                  {d.submitted === 0 ? (
                    <span className="text-xs text-gray-400">No submissions</span>
                  ) : !d.readyForFaculty ? (
                    <span
                      className="text-xs text-amber-600"
                      title="The department's HOD must approve all its submissions before you can sign it off."
                    >
                      Awaiting HOD ({d.pendingHod})
                    </span>
                  ) : d.pendingApproval > 0 ? (
                    <button
                      onClick={() => approve(d.dept)}
                      disabled={working}
                      className="text-pes text-xs font-medium border border-pes/30 rounded-md px-3 py-1.5 hover:bg-pes/5 disabled:opacity-50"
                    >
                      Approve ({d.pendingApproval})
                    </button>
                  ) : (
                    <span className="text-xs text-green-600">Approved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
