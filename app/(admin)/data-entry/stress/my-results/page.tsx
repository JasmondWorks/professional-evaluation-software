"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft2 } from "iconsax-react";
import { apiFetch } from "@/app/utils/apiFetch";

type Level = { name: string; stress: number | null } | null;

export default function MyStressResults() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    allowedDepartment: boolean;
    allowedFaculty: boolean;
    department: Level;
    faculty: Level;
  } | null>(null);

  useEffect(() => {
    apiFetch("/api/stress/my-results")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const Card = ({ label, level }: { label: string; level: Level }) => (
    <div className="bg-white rounded-xl border border-line p-6 shadow-sm text-center">
      <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">{label}</p>
      {level?.name && <p className="text-xs text-muted mb-1">{level.name}</p>}
      {level && level.stress !== null ? (
        <p className="text-4xl font-bold text-rose-600">{level.stress.toFixed(1)}%</p>
      ) : (
        <p className="text-sm text-muted mt-2">No results available for the current cycle yet.</p>
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <Link href="/data-entry" className="inline-flex items-center text-sm text-muted hover:text-pes transition-colors mb-3">
        <ArrowLeft2 size="16" className="mr-1" /> Back to Data Entry
      </Link>
      <h1 className="text-2xl font-bold text-strong">My Stress Results</h1>
      <p className="text-sm text-muted mb-6">
        The stress results your organization has granted you access to. Results are shown by group, never individually.
      </p>

      {loading ? (
        <div className="w-full p-12 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-pes border-t-transparent" />
        </div>
      ) : !data || (!data.allowedDepartment && !data.allowedFaculty) ? (
        <div className="rounded-xl border border-line bg-canvas p-8 text-center text-body">
          You don&apos;t currently have access to any stress results. Your organization admin can grant access to your
          department or faculty results.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data.allowedDepartment && <Card label="Department stress" level={data.department} />}
          {data.allowedFaculty && <Card label="Faculty / Division stress" level={data.faculty} />}
        </div>
      )}
    </div>
  );
}
