"use client";

import { useCallback, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from "@/app/utils/auth";
import { apiFetch } from "@/app/utils/apiFetch";
import { BackLink, Badge, Button } from "@/app/components/ui";
import { notify } from "@/lib/toast";

type Auditor = {
  id: string;
  name: string;
  email: string;
  gsm?: string | null;
};

type SelectedAuditor = Auditor & { selectedAt: string };

// Org admins no longer invite auditors directly — recognition is a platform
// admin decision. This page lets them pick from the pool of auditors the
// platform has already reviewed and approved for public recognition.
export default function BrowseAuditorsPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [available, setAvailable] = useState<Auditor[]>([]);
  const [selected, setSelected] = useState<SelectedAuditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const [availableRes, selectedRes] = await Promise.all([
        apiFetch(`/api/admin/orgs/${id}/available-auditors`),
        apiFetch(`/api/admin/orgs/${id}/auditors`),
      ]);
      setAvailable(await availableRes.json());
      setSelected(await selectedRes.json());
    } catch {
      notify.error("Could not load auditors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    const id = token ? jwtDecode<any>(token)?.orgId : null;
    if (!id) return;
    setOrgId(id);
    load(id);
  }, [load]);

  const handleSelect = async (auditorId: string) => {
    if (!orgId) return;
    setBusyId(auditorId);
    try {
      const res = await apiFetch(`/api/admin/orgs/${orgId}/auditors/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditorId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not select this auditor.");
      }
      notify.success("Auditor selected.");
      await load(orgId);
    } catch (err: any) {
      notify.error(err.message || "Could not select this auditor.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (auditorId: string) => {
    if (!orgId) return;
    setBusyId(auditorId);
    try {
      const res = await apiFetch(`/api/admin/orgs/${orgId}/auditors`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditorId }),
      });
      if (!res.ok) throw new Error("Could not remove this auditor.");
      notify.success("Auditor removed.");
      await load(orgId);
    } catch (err: any) {
      notify.error(err.message || "Could not remove this auditor.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 p-6 rounded-2xl shadow-md bg-white space-y-8">
      <BackLink href="/em-database" className="mb-2">Back to Database</BackLink>

      <div>
        <h1 className="text-2xl font-semibold mb-1">External Auditors</h1>
        <p className="text-sm text-muted">
          Choose from auditors the platform has reviewed and publicly
          recognized. New auditors are invited and approved by the platform
          admin, not by your organization.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Selected by your organization</h2>
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : selected.length === 0 ? (
          <p className="text-sm text-muted italic">No auditors selected yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {selected.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-line p-4">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-sm text-muted">{a.email}</div>
                  <div className="text-xs text-muted mt-1">
                    Selected on {new Date(a.selectedAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="outline"
                  disabled={busyId === a.id}
                  loading={busyId === a.id}
                  onClick={() => handleRemove(a.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Publicly recognized auditors</h2>
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : available.length === 0 ? (
          <p className="text-sm text-muted italic">No auditors available to select right now.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {available.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-line p-4">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-sm text-muted">{a.email}</div>
                  <Badge tone="success" className="mt-1">Approved</Badge>
                </div>
                <Button
                  disabled={busyId === a.id}
                  loading={busyId === a.id}
                  onClick={() => handleSelect(a.id)}
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
