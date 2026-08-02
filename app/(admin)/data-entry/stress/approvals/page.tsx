"use client";

// HOD/Dean approvals: the head of a department verifies and approves their
// staff's Form 6/7 entries for the current cycle, and can see who is still
// pending entry.

import { useEffect, useState, useCallback } from "react";
import { notify } from "@/lib/toast";
import StressSubmissionModal from "@/app/components/StressSubmissionModal";
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';

type Row = { name: string | null; submitted: boolean; approved: boolean };
type Status = {
  active: boolean;
  phase?: string;
  dept?: string;
  counts?: {
    staff: number;
    submitted: number;
    approved: number;
    pendingEntry: number;
    pendingApproval: number;
  };
  roster?: Row[];
};

export default function StressApprovals() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [viewing, setViewing] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    const token = getAccessToken();
    try {
      const res = await apiFetch("/api/stress/dept-status", {
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

  const approve = async (userName?: string) => {
    setWorking(true);
    const toastId = notify.loading("Approving…");
    try {
      const token = getAccessToken();
      const res = await apiFetch("/api/stress/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(userName ? { userName } : {}),
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

  const submitReject = async () => {
    if (!rejecting || !reason.trim()) return;
    setWorking(true);
    const toastId = notify.loading("Sending back…");
    try {
      const token = getAccessToken();
      const res = await apiFetch("/api/stress/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userName: rejecting, reason: reason.trim() }),
      });
      const data = await res.json();
      notify.dismiss(toastId);
      if (!res.ok) throw new Error(data.error || "Failed to send back");
      notify.success(data.message || "Sent back for re-entry");
      setRejecting(null);
      setReason("");
      await load();
    } catch (e) {
      notify.dismiss(toastId);
      notify.error(e instanceof Error ? e.message : "Failed to send back");
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-12 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-pes border-t-transparent mt-16" />
      </div>
    );
  }

  if (!status?.active) {
    return (
      <div className="w-full p-12 text-center text-muted mt-10">
        No stress exercise is currently open for your department.
      </div>
    );
  }

  const c = status.counts!;

  return (
    <div className="w-full p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-strong">Stress Entries — {status.dept}</h1>
      <p className="text-sm text-muted mb-6">
        Verify and approve your department&apos;s theme &amp; feeling (Form 6/7) entries for the current cycle.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Staff", value: c.staff },
          { label: "Submitted", value: c.submitted },
          { label: "Approved", value: c.approved },
          { label: "Awaiting approval", value: c.pendingApproval },
        ].map((s) => (
          <div key={s.label} className="bg-canvas rounded-lg p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted">{s.label}</p>
            <p className="text-2xl font-bold text-strong">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-3">
        <button
          onClick={() => approve()}
          disabled={working || c.pendingApproval === 0}
          className="bg-pes text-white px-5 py-2.5 rounded-lg font-medium hover:bg-pes-800 transition-colors disabled:opacity-50"
        >
          Approve all pending ({c.pendingApproval})
        </button>
      </div>

      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-canvas border-b text-body">
            <tr>
              <th className="px-6 py-3 font-semibold">Staff</th>
              <th className="px-6 py-3 font-semibold">Entry</th>
              <th className="px-6 py-3 font-semibold">Approval</th>
              <th className="px-6 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {status.roster!.map((r) => (
              <tr key={r.name} className="hover:bg-canvas/50">
                <td className="px-6 py-3 font-medium text-strong">{r.name}</td>
                <td className="px-6 py-3">
                  {r.submitted ? (
                    <span className="text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-medium">Submitted</span>
                  ) : (
                    <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-medium">Not yet entered</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  {r.approved ? (
                    <span className="text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-medium">Approved</span>
                  ) : (
                    <span className="text-muted text-xs">—</span>
                  )}
                </td>
                <td className="px-6 py-3 text-right">
                  {r.submitted && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setViewing(r.name!)}
                        className="text-body text-xs font-medium border border-line rounded-md px-3 py-1.5 hover:bg-canvas"
                      >
                        View
                      </button>
                      {!r.approved && (
                        <>
                          <button
                            onClick={() => { setRejecting(r.name!); setReason(""); }}
                            disabled={working}
                            className="text-red-600 text-xs font-medium border border-red-200 rounded-md px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
                          >
                            Send back
                          </button>
                          <button
                            onClick={() => approve(r.name!)}
                            disabled={working}
                            className="text-pes text-xs font-medium border border-pes/30 rounded-md px-3 py-1.5 hover:bg-pes/5 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewing && <StressSubmissionModal name={viewing} onClose={() => setViewing(null)} />}

      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !working && setRejecting(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-strong mb-1">Send back for re-entry</h2>
            <p className="text-sm text-muted mb-4">
              <span className="font-medium text-body">{rejecting}</span> will be able to re-fill and re-submit their form. Tell them why.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Several categories look incomplete — please review and resubmit."
              className="w-full border border-line rounded-lg p-3 text-sm outline-none focus:border-pes"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRejecting(null)}
                disabled={working}
                className="px-4 py-2 text-sm font-medium text-body hover:bg-line/50 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={working || !reason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {working ? "Sending…" : "Send back"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
