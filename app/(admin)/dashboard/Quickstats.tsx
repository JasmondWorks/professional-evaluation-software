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
  const [quickStats, setQuickStats] = useState<(number | null)[]>([
    null,
    null,
    null,
  ]);
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
        setQuickStats(res);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    getStatData();
  }, []);

  const cards = [
    { label: "Employees", value: quickStats[0], href: "/em-database", icon: People, accent: true },
    { label: "Completed appraisals", value: quickStats[1], href: "/completed-appraisals", icon: Award, accent: false },
    { label: "Pending appraisals", value: quickStats[2], href: "/assessment", icon: Timer, accent: false },
    { label: "Pending assessments", value: openEvaluations ?? 0, href: "/goals", icon: TaskSquare, accent: false, ready: true },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, href, icon: Icon, accent, ready }) => {
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
