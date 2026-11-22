"use client";

import Link from "next/link";
import { ArrowRight2 } from "iconsax-react";
import { useModelAccess, hasEntitlement } from "@/app/components/useModelAccess";
import type { EntitlementKey } from "@/app/lib/billing/entitlements";

// Landing for the Student–Teacher Ratio model. The original PES app presents
// TWO distinct models here — Robust and Ordinary — each with its own
// optimization formula (see utils/sharedLogic.ts: findOptimalK_robust vs
// findOptimalK_ordinary). This page lets the user pick which one to run; the
// section NavBar (layout.tsx) also links to both.
const models = [
  {
    n: 1,
    key: "robust",
    title: "Robust Optimization",
    href: "/models/student-teacher/robust",
    entitlement: "student-teacher.robust" as EntitlementKey,
    desc: "Maximizes the robust efficiency function Hʳ, which accounts for out-of-hours workload (research, community service and assessment) in addition to formal consultation. Recommended when staff carry significant non-teaching responsibilities.",
    accent: "border-blue-200 hover:border-pes-300",
    badge: "bg-pes-50 text-pes-700",
  },
  {
    n: 2,
    key: "ordinary",
    title: "Ordinary Optimization",
    href: "/models/student-teacher/ordinary",
    entitlement: "student-teacher.ordinary" as EntitlementKey,
    desc: "Maximizes the ordinary efficiency function Hᵒ, based on formal consultation and assessment workload only. A simpler baseline for the optimal student–teacher ratio.",
    accent: "border-emerald-200 hover:border-emerald-400",
    badge: "bg-emerald-50 text-emerald-700",
  },
];

export default function StudentTeacherIndex() {
  // The two optimizations are sold separately: every academic tier gets the
  // ordinary one, and robust is Premium. The card for a method the plan does
  // not include is not shown, so nobody opens a page /api/results would refuse
  // to save from.
  const access = useModelAccess();
  const available = models.filter((m) => hasEntitlement(access, m.entitlement));

  if (access.loading) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Student–Teacher Ratio</h1>
        <p className="text-body max-w-2xl">
          This model estimates the optimal student–teacher ratio and the
          academic and management staff required, using queuing-theory workload
          analysis.{" "}
          {available.length > 1
            ? "Choose one of the two optimization models below to begin."
            : "Choose the optimization model below to begin."}
        </p>
      </div>

      <div
        className={`grid grid-cols-1 gap-6 ${
          available.length > 1 ? "md:grid-cols-2" : ""
        }`}
      >
        {available.map((m) => (
          <Link
            key={m.key}
            href={m.href}
            className={`group bg-white rounded-xl border ${m.accent} p-6 shadow-sm transition-all flex flex-col`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`w-9 h-9 rounded-full ${m.badge} flex items-center justify-center font-bold`}
              >
                {m.n}
              </span>
              <h2 className="text-lg font-bold text-strong">{m.title}</h2>
            </div>
            <p className="text-sm text-body flex-1">{m.desc}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-pes group-hover:gap-2 transition-all">
              Open model <ArrowRight2 size="16" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
