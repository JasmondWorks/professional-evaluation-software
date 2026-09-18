"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/apiFetch";
import { Alert, Card, PageHeader, Skeleton } from "@/app/components/ui";

type OrgRow = {
  id: number;
  name: string;
  category: string;
  plan: string;
  ongoing: boolean;
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Organizations"
        subtitle={orgs ? `${orgs.length} organizations on the platform` : "Every organization on PES"}
      />

      {error ? (
        <Alert tone="danger">{error}</Alert>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            {!orgs ? (
              <div className="p-5">
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b border-line">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Plan</th>
                    <th className="p-4 font-medium">Users</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((org) => (
                    <tr key={org.id} className="border-b border-line last:border-0">
                      <td className="p-4 font-medium text-strong">{org.name}</td>
                      <td className="p-4 text-muted capitalize">{org.category}</td>
                      <td className="p-4 text-muted capitalize">{org.plan}</td>
                      <td className="p-4 text-strong">{org.userCount}</td>
                      <td className="p-4">
                        <span className={org.ongoing ? "text-success-700" : "text-muted"}>
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
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
