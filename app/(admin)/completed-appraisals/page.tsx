"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "iconsax-react";
import { getAccessToken } from "@/app/utils/auth";
import { apiFetch } from '@/app/utils/apiFetch';
import { DataTable } from "@/app/components/ui/DataTable";
import { PageHeader } from "@/app/components/ui";
import type { TableColumn } from "@/app/components/ui/Table";

type Appraisal = {
  id: number;
  pesuser_name: string;
  dept: string | null;
  teaching_quality_evaluation: number | string | null;
  research_quality_evaluation: number | string | null;
  administrative_quality_evaluation: number | string | null;
  community_quality_evaluation: number | string | null;
};

const num = (v: number | string | null) => (v == null ? null : Number(v));
const fmt = (v: number | string | null) => {
  const n = num(v);
  return n == null || isNaN(n) ? "—" : n.toFixed(2);
};

function average(a: Appraisal): string {
  const vals = [
    a.teaching_quality_evaluation,
    a.research_quality_evaluation,
    a.administrative_quality_evaluation,
    a.community_quality_evaluation,
  ]
    .map(num)
    .filter((n): n is number => n != null && !isNaN(n));
  if (vals.length === 0) return "—";
  return (vals.reduce((s, n) => s + n, 0) / vals.length).toFixed(2);
}

export default function CompletedAppraisalsPage() {
  const [rows, setRows] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setError("Please log in to view completed appraisals.");
      setLoading(false);
      return;
    }
    apiFetch("/api/getCompletedAppraisals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRows(data);
        else setError(data?.error || "Failed to load completed appraisals.");
      })
      .catch(() => setError("Failed to load completed appraisals."))
      .finally(() => setLoading(false));
  }, []);

  const numCol = (key: string, label: string): TableColumn<Appraisal> => ({
    key,
    label,
    align: "right",
    render: (a) => <span className="text-body tabular-nums">{fmt((a as any)[key])}</span>,
  });

  const columns: TableColumn<Appraisal>[] = [
    { key: "pesuser_name", label: "Employee", render: (a) => <span className="font-medium text-strong">{a.pesuser_name}</span> },
    { key: "dept", label: "Department", render: (a) => a.dept || "—" },
    numCol("teaching_quality_evaluation", "Teaching"),
    numCol("research_quality_evaluation", "Research"),
    numCol("administrative_quality_evaluation", "Admin"),
    numCol("community_quality_evaluation", "Community"),
    {
      key: "average",
      label: "Average",
      align: "right",
      render: (a) => <span className="font-semibold text-pes-700 tabular-nums">{average(a)}</span>,
    },
  ];

  return (
    <main className="w-full min-h-screen bg-canvas px-4 sm:px-6 lg:px-8 py-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-pes transition-colors mb-4"
      >
        <ArrowLeft size={18} />
        Back to dashboard
      </Link>

      <PageHeader
        title="Completed appraisals"
        subtitle={!loading && !error ? `${rows.length} record${rows.length === 1 ? "" : "s"}` : undefined}
      />

      {error ? (
        <div className="rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700" role="alert">
          {error}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          searchable
          searchKeys={["pesuser_name", "dept"]}
          searchPlaceholder="Search by employee or department…"
          pageSize={12}
          emptyMessage="No completed appraisals yet — they appear here once submitted and accepted."
        />
      )}
    </main>
  );
}
