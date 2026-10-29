"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "iconsax-react";
import { apiFetch } from "@/app/utils/apiFetch";
import Skeleton from "@/app/components/ui/Skeleton";
import Table from "@/app/components/ui/Table";
import type { TableColumn } from "@/app/components/ui/Table";
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

type StatusCount = Overview["subsByStatus"][number];
type RecentOrg = Overview["recentOrgs"][number];

const statusColumns: TableColumn<StatusCount>[] = [
  {
    key: "status",
    label: "Status",
    render: (s) => <span className="capitalize text-body">{s.status.toLowerCase()}</span>,
  },
  { key: "count", label: "Subscriptions", align: "right", render: (s) => <span className="font-medium text-strong">{s.count}</span> },
];

const recentOrgColumns: TableColumn<RecentOrg>[] = [
  { key: "name", label: "Name", render: (org) => <span className="font-medium text-strong">{org.name}</span> },
  { key: "category", label: "Category", render: (org) => <span className="capitalize">{org.category}</span> },
  { key: "plan", label: "Plan", render: (org) => <span className="capitalize">{org.plan}</span> },
];

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
  const router = useRouter();
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

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-strong">Subscriptions by status</h2>
        <Table
          columns={statusColumns}
          data={data?.subsByStatus ?? []}
          loading={loading}
          emptyMessage="No subscriptions yet."
          skeletonRows={3}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-strong">Recently created organizations</h2>
          <Link href="/organizations" className="text-sm font-medium text-pes-600 hover:text-pes-700 inline-flex items-center gap-1">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <Table
          columns={recentOrgColumns}
          data={data?.recentOrgs ?? []}
          loading={loading}
          emptyMessage="No organizations yet."
          onRowClick={(org) => router.push(`/organizations/${org.id}`)}
        />
      </div>
    </div>
  );
}
