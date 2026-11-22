"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/apiFetch";
import { BackLink, Button, Input } from "@/app/components/ui";

type BrowsedAuditor = {
  id: string;
  name: string;
  email: string;
  gsm: string | null;
  association: { status: string; consecutive_years: number; cooldown_until: string | null } | null;
};

export default function BrowseAuditorsPage() {
  const [auditors, setAuditors] = useState<BrowsedAuditor[]>([]);
  const [q, setQ] = useState("");
  const [message, setMessage] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const fetchAuditors = async (query?: string) => {
    const res = await apiFetch(`/api/org/auditors/browse${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    const data = await res.json();
    setAuditors(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchAuditors();
  }, []);

  const isCoolingDown = (a: BrowsedAuditor) =>
    a.association?.cooldown_until && new Date(a.association.cooldown_until) > new Date();

  const handleAssign = async (auditorId: string) => {
    setAssigningId(auditorId);
    setMessage("");
    try {
      const res = await apiFetch("/api/org/auditors/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditorId }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      fetchAuditors(q);
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 rounded-2xl shadow-md bg-white">
      <BackLink href="/em-database" className="mb-6">Back to Database</BackLink>

      <h1 className="text-2xl font-semibold mb-2">Globally Recognized Auditors</h1>
      <p className="text-sm text-muted mb-6">
        These auditors have been granted platform-wide recognition and may serve several organizations
        at once. Add one to your organization for an upcoming evaluation.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchAuditors(q);
        }}
        className="flex gap-2 mb-6"
      >
        <Input
          placeholder="Search by name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button type="submit">Search</Button>
      </form>

      {message && <p className="mb-4 text-sm text-pes font-medium">{message}</p>}

      {auditors.length === 0 ? (
        <p className="text-sm text-muted">No globally recognized auditors found.</p>
      ) : (
        <ul className="space-y-3">
          {auditors.map((a) => (
            <li key={a.id} className="border border-line rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{a.name}</p>
                <p className="text-sm text-muted">{a.email}</p>
                {a.association?.status === "active" && (
                  <p className="text-xs text-success-600 mt-1">Already associated with your organization</p>
                )}
                {isCoolingDown(a) && (
                  <p className="text-xs text-danger-600 mt-1 font-medium">
                    Paused for your organization until{" "}
                    {new Date(a.association!.cooldown_until as string).toLocaleDateString()} (3 consecutive
                    years served) — still available to other organizations.
                  </p>
                )}
              </div>
              <Button
                size="sm"
                disabled={a.association?.status === "active" || !!isCoolingDown(a) || assigningId === a.id}
                loading={assigningId === a.id}
                onClick={() => handleAssign(a.id)}
              >
                {a.association?.status === "active" ? "Added" : "Add to my org"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
