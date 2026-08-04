"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import {
  Award,
  Activity,
  Heart,
  People,
  Book1,
  Verify,
  Hierarchy,
  ArrowRight2,
} from "iconsax-react";
import { orgTerms } from "@/app/lib/orgTerms";
import { getAccessToken } from "@/app/utils/auth";
import { apiFetch } from "@/app/utils/apiFetch";

export const dynamic = "force-dynamic";

type EvaluationType = "appraisal" | "performance" | "stress";

type CardDef = {
  title: string;
  description: string;
  href: string;
  Icon: any;
  color: string; // tailwind bg/text for the icon tile
  enabled?: boolean;
  disabledNote?: string;
};

function ModelCard({ def }: { def: CardDef }) {
  const enabled = def.enabled !== false;
  const inner = (
    <div
      className={`group relative bg-surface border border-line rounded-2xl p-6 transition-all duration-300 overflow-hidden flex flex-col h-full ${
        enabled ? "hover:shadow-xl hover:border-pes/30 hover:-translate-y-1 cursor-pointer" : "opacity-60"
      }`}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-pes/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="flex items-start justify-between relative z-10">
        <div className={`p-3 rounded-xl ${def.color}`}>
          <def.Icon size={26} variant="Bulk" />
        </div>
        <div className="w-8 h-8 rounded-full bg-canvas flex items-center justify-center group-hover:bg-pes group-hover:text-white transition-colors duration-300">
          <ArrowRight2 size={16} className="text-muted group-hover:text-white transition-colors duration-300" />
        </div>
      </div>
      <div className="mt-6 relative z-10 grow">
        <h3 className="text-lg font-semibold text-strong group-hover:text-pes transition-colors duration-200">
          {def.title}
        </h3>
        <p className="mt-2 text-sm text-muted leading-relaxed">{def.description}</p>
        {!enabled && def.disabledNote && (
          <p className="mt-3 text-xs text-warning-600">{def.disabledNote}</p>
        )}
      </div>
    </div>
  );
  return enabled ? <Link href={def.href}>{inner}</Link> : <div>{inner}</div>;
}

export default function DataEntryPage() {
  const [evaluation, setEvaluation] = useState<EvaluationType[]>([]);

  const token = typeof window !== "undefined" ? getAccessToken() : null;
  const user = token ? jwtDecode<any>(token) : null;
  const terms = orgTerms(user?.productCategory ?? user?.category);

  useEffect(() => {
    if (!user?.org) return;
    apiFetch(`/api/org/${encodeURIComponent(user.org)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res?.data?.evaluation) setEvaluation(res.data.evaluation);
      })
      .catch(console.error);
  }, [user?.org]);

  const has = (key: EvaluationType) => evaluation.includes(key);
  const role = user?.role;

  // Auditors get their own single entry surface.
  if (role === "auditor") {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-strong tracking-tight">Data Entry</h1>
          <p className="mt-2 text-muted max-w-2xl text-sm">Record and review the entries assigned to you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModelCard def={{ title: "Auditor entries", description: "Enter and review staff audit responses.", href: "/data-entry/auditor", Icon: Verify, color: "bg-purple-50 text-purple-600" }} />
        </div>
      </div>
    );
  }

  const modelCards: CardDef[] = [
    {
      title: "Appraisal",
      description: "Complete your appraisal self-assessment forms.",
      href: "/data-entry/appraisal",
      Icon: Award,
      color: "bg-pes-50 text-pes-600",
      enabled: has("appraisal"),
      disabledNote: "Not enabled by your organization yet.",
    },
    {
      title: "Performance",
      description: "Enter your performance evaluation data.",
      href: "/data-entry/performance",
      Icon: Activity,
      color: "bg-emerald-50 text-emerald-600",
      enabled: has("performance"),
      disabledNote: "Not enabled by your organization yet.",
    },
    {
      title: "Stress",
      description: "Fill your stress category, theme & feeling forms.",
      href: "/data-entry/stress/stress-category",
      Icon: Heart,
      color: "bg-rose-50 text-rose-600",
      enabled: has("stress"),
      disabledNote: "Not enabled by your organization yet.",
    },
  ];

  // Role-specific entry surfaces.
  const roleCards: CardDef[] = [];
  if (role === "hod") {
    roleCards.push(
      { title: "Staff data entries", description: "Enter data on behalf of your department's staff.", href: "/data-entry/employee", Icon: People, color: "bg-pes-50 text-pes-600" },
      { title: "Student data entries", description: "Record student data for your department.", href: "/data-entry/students", Icon: Book1, color: "bg-warning-50 text-warning-600" },
      { title: "Approve department stress", description: "Verify and approve your department's stress submissions.", href: "/data-entry/stress/approvals", Icon: Verify, color: "bg-rose-50 text-rose-600" },
    );
  }
  if (role === "unit-head") {
    roleCards.push({
      title: `Approve ${terms.unit.toLowerCase()} stress`,
      description: `Sign off the departments in your ${terms.unit.toLowerCase()} for the current cycle.`,
      href: "/data-entry/stress/faculty-approvals",
      Icon: Verify,
      color: "bg-teal-50 text-teal-600",
    });
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-strong tracking-tight">Data Entry</h1>
        <p className="mt-2 text-muted max-w-2xl text-sm">
          Choose a form to complete. Cards that are dimmed haven&apos;t been enabled by your organization yet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...modelCards, ...roleCards].map((def, i) => (
          <ModelCard key={`${def.title}-${i}`} def={def} />
        ))}
      </div>
    </div>
  );
}
