"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/app/utils/apiFetch";
import { Alert, Badge, BackLink, Card, CardHeader, CardBody, DataTable, PageHeader, Skeleton } from "@/app/components/ui";
import type { TableColumn } from "@/app/components/ui/Table";

type OrgSummary = {
  id: number;
  name: string;
  category: string;
  plan: string;
  ongoing: boolean;
  created_at: string | null;
  userCount: number;
};

type OrgUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  display_role: string | null;
  dept: string | null;
  audit_count: number | null;
};

// The super-admin's drill-down into one organization: who's in it, what role
// each person holds, and which of them are accepted external auditors —
// exactly the detail the platform-wide lists (organizations, all-auditors)
// summarize but don't show per-org.
export default function OrganizationDetailPage({ params }: { params: { orgId: string } }) {
  const orgId = params.orgId;
  const [org, setOrg] = useState<OrgSummary | null>(null);
  const [users, setUsers] = useState<OrgUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/admin/orgs-overview?id=${encodeURIComponent(orgId)}`).then(async (res) => {
        if (!res.ok) throw new Error("Failed to load organization");
        const body: { data: OrgSummary[] } = await res.json();
        const match = body.data[0];
        if (!match) throw new Error("Organization not found");
        return match;
      }),
      apiFetch(`/api/admin/orgs/${orgId}/users`).then(async (res) => {
        if (!res.ok) throw new Error("Failed to load users for this organization");
        return res.json();
      }),
    ])
      .then(([orgData, userData]) => {
        setOrg(orgData);
        setUsers(userData);
      })
      .catch((err) => setError(err.message));
  }, [orgId]);

  const auditors = useMemo(() => (users ?? []).filter((u) => u.role === "auditor"), [users]);

  const roleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of users ?? []) {
      counts.set(u.role, (counts.get(u.role) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count);
  }, [users]);

  const staffColumns: TableColumn<OrgUser>[] = [
    { key: "name", label: "Name", render: (u) => <span className="font-medium text-strong">{u.name}</span> },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (u) => <Badge tone="brand">{u.display_role || u.role}</Badge>,
    },
    { key: "dept", label: "Department", render: (u) => u.dept || "—" },
  ];

  const roleColumns: TableColumn<{ role: string; count: number }>[] = [
    { key: "role", label: "Role", render: (r) => <span className="capitalize text-body">{r.role}</span> },
    { key: "count", label: "Users", align: "right", render: (r) => <span className="font-medium text-strong">{r.count}</span> },
  ];

  const auditorColumns: TableColumn<OrgUser>[] = [
    { key: "name", label: "Name", render: (u) => <span className="font-medium text-strong">{u.name}</span> },
    { key: "email", label: "Email" },
    {
      key: "audit_count",
      label: "Audits done",
      align: "center",
      render: (u) => u.audit_count ?? 0,
    },
    {
      key: "eligible",
      label: "Status",
      render: (u) => {
        const eligible = (u.audit_count ?? 0) < 4;
        return (
          <Badge tone={eligible ? "success" : "neutral"}>
            {eligible ? "Eligible for audit" : "Max audits reached"}
          </Badge>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <BackLink href="/organizations">Back to organizations</BackLink>
        <Alert tone="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <BackLink href="/organizations">Back to organizations</BackLink>

      {!org ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <PageHeader
          title={org.name}
          subtitle={
            <span className="flex flex-wrap items-center gap-2">
              <span className="capitalize">{org.category}</span>
              <span className="text-muted">·</span>
              <span className="capitalize">{org.plan}</span>
              <span className="text-muted">·</span>
              <Badge tone={org.ongoing ? "success" : "neutral"}>{org.ongoing ? "Ongoing" : "Idle"}</Badge>
              <span className="text-muted">·</span>
              <span>{org.userCount} users</span>
            </span>
          }
        />
      )}

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-strong">Users by role</h2>
            <p className="mt-0.5 text-sm text-muted">How this organization's staff are distributed across roles.</p>
          </CardHeader>
          <CardBody>
            <DataTable
              columns={roleColumns}
              data={roleCounts}
              loading={!users}
              emptyMessage="No staff in this organization."
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-strong">External auditors</h2>
            <p className="mt-0.5 text-sm text-muted">
              Accepted auditors attached to this organization and their audit eligibility.
            </p>
          </CardHeader>
          <CardBody>
            <DataTable
              columns={auditorColumns}
              data={auditors}
              loading={!users}
              emptyMessage="No auditors in this organization."
              searchable
              searchKeys={["name", "email"]}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-strong">All staff</h2>
            <p className="mt-0.5 text-sm text-muted">Every role present in this organization.</p>
          </CardHeader>
          <CardBody>
            <DataTable
              columns={staffColumns}
              data={users ?? []}
              loading={!users}
              emptyMessage="No staff in this organization."
              searchable
              searchKeys={["name", "email", "role", "dept"]}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
