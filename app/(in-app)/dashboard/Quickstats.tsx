"use client";

import { People, Award, Timer, TaskSquare } from "iconsax-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import Skeleton from '@/app/components/ui/Skeleton';

export default function Quickstats({
  openEvaluations,
}: {
  // Goals still open for data entry (computed on the dashboard from the goals list).
  openEvaluations?: number;
} = {}) {
  type Stats = {
    employees: number;
    assessable: number;
    completedAppraisals: number;
    pendingAppraisals: number;
  };
  const [quickStats, setQuickStats] = useState<Stats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const access_token = getAccessToken() as string;

    async function getStatData() {
      try {
        const req = await apiFetch("/api/getStatData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`
          },
        });

        const res = await req.json();
        if (res && typeof res.employees === "number") setQuickStats(res);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    getStatData();
  }, []);

  // The employee tile carries both numbers. The assessment page works from the
  // assessable subset (administrators evaluate rather than being assessed), so
  // showing only the total made the two pages look like they disagreed.
  const employees = quickStats?.employees ?? 0;
  const assessable = quickStats?.assessable ?? 0;

  const cards = [
    {
      label: "Employees",
      value: quickStats?.employees,
      href: "/em-database",
      icon: People,
      accent: true,
      note:
        employees === assessable
          ? undefined
          : `${assessable} to assess`,
    },
    { label: "Completed appraisals", value: quickStats?.completedAppraisals, href: "/completed-appraisals", icon: Award, accent: false },
    { label: "Pending appraisals", value: quickStats?.pendingAppraisals, href: "/assessment", icon: Timer, accent: false },
    { label: "Pending assessments", value: openEvaluations ?? 0, href: "/goals", icon: TaskSquare, accent: false, ready: true },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, href, icon: Icon, accent, ready, note }) => {
        const showValue = ready || !isLoadingStats;
        return (
          <Link
            key={label}
            href={href}
            className={`group rounded-xl border p-5 shadow-card transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md flex items-start justify-between gap-3
              ${accent ? "bg-pes text-white border-pes-800 hover:border-pes-700" : "bg-surface border-line hover:border-pes-200"}`}
          >
            <div className="min-w-0">
              <p className={`text-sm ${accent ? "text-white/80" : "text-muted"}`}>
                {label}
              </p>
              <div className={`mt-2 text-3xl font-semibold tabular-nums ${accent ? "text-white" : "text-strong"}`}>
                {showValue ? (
                  (value ?? 0).toString()
                ) : (
                  <Skeleton className={`h-9 w-14 ${accent ? "bg-white/25" : ""}`} />
                )}
              </div>
              {note && showValue ? (
                <p className={`mt-1 text-xs ${accent ? "text-white/70" : "text-muted"}`}>
                  {note}
                </p>
              ) : null}
              <span className={`mt-2 inline-block text-xs font-medium ${accent ? "text-white/80 group-hover:text-white" : "text-pes-600 group-hover:text-pes-700"}`}>
                View all →
              </span>
            </div>
            <span className={`shrink-0 rounded-lg p-2 ${accent ? "bg-white/15" : "bg-pes-50"}`}>
              <Icon size={24} variant="Bulk" className={accent ? "text-white" : "text-pes-700"} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
