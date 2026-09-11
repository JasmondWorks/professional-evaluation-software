"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/apiFetch";

type OrgRow = {
  id: number;
  name: string;
  category: string;
  plan: string;
  ongoing: boolean;
  maintenance_model: boolean | null;
  created_at: string | null;
  userCount: number;
};

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<OrgRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/api/admin/orgs-overview")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load organizations");
        }
        return res.json();
      })
      .then(setOrgs)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!orgs) return <div className="p-6">Loading organizations…</div>;

  return (
    <div className="flex flex-col w-full bg-canvas">
      <div className="p-4">
        <h1 className="text-pes text-3xl">Organizations</h1>
        <p className="text-muted text-sm mt-1">{orgs.length} organizations on the platform</p>
      </div>
      <hr />

      <div className="p-6 overflow-x-auto">
        <table className="w-full bg-white rounded-xl shadow-sm text-sm">
          <thead>
            <tr className="text-left text-muted border-b">
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Users</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr key={org.id} className="border-b last:border-0">
                <td className="p-4 font-medium">{org.name}</td>
                <td className="p-4 text-muted">{org.category}</td>
                <td className="p-4 text-muted">{org.plan}</td>
                <td className="p-4">{org.userCount}</td>
                <td className="p-4">
                  <span className={org.ongoing ? "text-emerald-600" : "text-muted"}>
                    {org.ongoing ? "Ongoing" : "Idle"}
                  </span>
                </td>
                <td className="p-4 text-muted">
                  {org.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted italic">
                  No organizations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
