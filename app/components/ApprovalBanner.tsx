"use client";

// Dashboard nudge for department/faculty heads: when submissions are awaiting
// THEIR approval, show a banner with a direct link to the right approvals page.
// Mirrors StressCycleBanner (which nudges staff about open forms). Refetches on
// focus so it clears once they've approved, without a page refresh.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { Notification } from "iconsax-react";
import { orgTerms } from "@/app/lib/orgTerms";
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';

export default function ApprovalBanner() {
  const [pending, setPending] = useState(0);
  const [cfg, setCfg] = useState<{ href: string; unit: string } | null>(null);

  const refetch = useCallback(async () => {
    const token = typeof window !== "undefined" ? getAccessToken() : null;
    if (!token || token === "undefined" || token === "null") return;
    let decoded: any = {};
    try {
      decoded = jwtDecode(token);
    } catch {
      return;
    }
    const role = decoded?.role;
    // Only department heads (HOD) and faculty/division heads see this.
    const endpoint =
      role === "hod"
        ? { url: "/api/stress/dept-status", href: "/data-entry/stress/approvals", unit: "department" }
        : role === "unit-head"
          ? {
              url: "/api/stress/faculty-status",
              href: "/data-entry/stress/faculty-approvals",
              unit: orgTerms(decoded?.productCategory ?? decoded?.category).unit.toLowerCase(),
            }
          : null;
    if (!endpoint) return;
    setCfg({ href: endpoint.href, unit: endpoint.unit });
    try {
      const res = await apiFetch(endpoint.url);
      const d = await res.json();
      if (d?.active === false) {
        setPending(0);
        return;
      }
      const n = Number(d?.counts?.pendingApproval ?? 0);
      setPending(Number.isFinite(n) ? n : 0);
    } catch {
      /* keep last known */
    }
  }, []);

  useEffect(() => {
    refetch();
    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  if (!cfg || pending <= 0) return null;

  return (
    <div className="mx-6 mt-4 flex items-center justify-between gap-4 rounded-lg border border-warning-100 bg-warning-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <Notification size={22} className="text-warning-600 shrink-0" variant="Bold" />
        <div>
          <p className="text-sm font-semibold text-warning-700">Approvals waiting on you</p>
          <p className="text-sm text-warning-700">
            {pending} stress submission{pending === 1 ? "" : "s"} in your {cfg.unit} {pending === 1 ? "is" : "are"} awaiting your approval.
          </p>
        </div>
      </div>
      <Link
        href={cfg.href}
        className="shrink-0 bg-warning-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-warning-700 transition-colors"
      >
        Review &amp; approve
      </Link>
    </div>
  );
}
