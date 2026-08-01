"use client";

// Dashboard widget: shows a staff member their OWN department / faculty stress
// results — but only for the levels the org admin has granted them access to.
// Renders nothing when no access is granted. Group-level only, never individual.

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/app/utils/apiFetch";

type Level = { name: string; stress: number | null } | null;

function Item({ label, level }: { label: string; level: Level }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-5 text-center">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      {level?.name && <p className="text-[11px] text-gray-400 mb-1 truncate">{level.name}</p>}
      {level && level.stress !== null ? (
        <p className="text-3xl font-bold text-rose-600">{level.stress.toFixed(1)}%</p>
      ) : (
        <p className="text-xs text-gray-400 mt-2">No result for the current cycle yet.</p>
      )}
    </div>
  );
}

export default function MyStressResultsCard() {
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
      .catch(() => {});
  }, []);

  if (!data || (!data.allowedDepartment && !data.allowedFaculty)) return null;

  return (
    <div className="mx-6 mb-6 bg-white rounded-lg shadow-md shadow-gray-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold text-gray-900">My Stress Results</h2>
        <Link href="/data-entry/stress/my-results" className="text-sm text-pes hover:underline">
          View details
        </Link>
      </div>
      <p className="text-sm text-gray-500 mb-4">Shared with you by your organization — group-level results only.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.allowedDepartment && <Item label="Department stress" level={data.department} />}
        {data.allowedFaculty && <Item label="Faculty / Division stress" level={data.faculty} />}
      </div>
    </div>
  );
}
