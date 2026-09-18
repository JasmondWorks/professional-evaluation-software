"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "iconsax-react";
import { apiFetch } from "@/app/utils/apiFetch";
import Card from "@/app/components/ui/Card";
import Skeleton from "@/app/components/ui/Skeleton";
import { Alert } from "@/app/components/ui";

type Overview = {
  orgCount: number;
  userCount: number;
  activeSubCount: number;
  usersByRole: { role: string; count: number }[];
  subsByStatus: { status: string; count: number }[];
  plans: { id: string; name: string }[];
  recentOrgs: { id: number; name: string; category: string; plan: string; ongoing: boolean; created_at: string | null }[];
};

function StatTile({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <p className="mt-1 text-3xl font-semibold text-strong tabular-nums">{value}</p>
      )}
    </div>
  );
}

// The super-admin's dashboard: platform-wide numbers, not any one org's. This
// is the branch of the shared dashboard that replaces both the org-admin's
// Quickstats and the employee's ProfileChunk — neither is scoped correctly
// for a role that belongs to no organization.
export default function PlatformOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/api/admin/overview")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load platform overview");
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <Alert tone="danger">{error}</Alert>;

  const loading = !data;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatTile label="Organizations" value={data?.orgCount ?? 0} loading={loading} />
        <StatTile label="Users" value={data?.userCount ?? 0} loading={loading} />
        <StatTile label="Active subscriptions" value={data?.activeSubCount ?? 0} loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <h2 className="text-lg font-semibold text-strong">Users by role</h2>
          </div>
          <div className="p-5 flex flex-col gap-2">
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : data!.usersByRole.length === 0 ? (
              <p className="text-sm text-muted italic">No users yet.</p>
            ) : (
              data!.usersByRole
                .sort((a, b) => b.count - a.count)
                .map((r) => (
                  <div key={r.role} className="flex justify-between text-sm">
                    <span className="text-muted capitalize">{r.role}</span>
                    <span className="font-medium text-strong">{r.count}</span>
                  </div>
                ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <h2 className="text-lg font-semibold text-strong">Subscriptions by status</h2>
          </div>
          <div className="p-5 flex flex-col gap-2">
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : data!.subsByStatus.length === 0 ? (
              <p className="text-sm text-muted italic">No subscriptions yet.</p>
            ) : (
              data!.subsByStatus.map((s) => (
                <div key={s.status} className="flex justify-between text-sm">
                  <span className="text-muted capitalize">{s.status.toLowerCase()}</span>
                  <span className="font-medium text-strong">{s.count}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-lg font-semibold text-strong">Recently created organizations</h2>
          <Link href="/organizations" className="text-sm font-medium text-pes-600 hover:text-pes-700 inline-flex items-center gap-1">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="p-5">
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : data!.recentOrgs.length === 0 ? (
            <p className="text-sm text-muted italic">No organizations yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {data!.recentOrgs.map((org) => (
                <div key={org.id} className="flex justify-between py-2 text-sm">
                  <span className="font-medium text-strong">{org.name}</span>
                  <span className="text-muted">{org.category}</span>
                  <span className="text-muted">{org.plan}</span>
                  <span className={org.ongoing ? "text-success-700" : "text-muted"}>
                    {org.ongoing ? "Ongoing" : "Idle"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
