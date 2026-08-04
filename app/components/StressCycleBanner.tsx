"use client";

// Dashboard notification: when a stress cycle is open and this user has a form
// to fill, show a friendly banner with a call-to-action straight to that form.
// Driven by /api/stress/active-cycle, which returns the single most relevant CTA.

import Link from "next/link";
import { Notification } from "iconsax-react";
import { useActiveCycle } from "./useActiveCycle";

export default function StressCycleBanner() {
  // Polls + refetches on focus, so the banner appears/updates without a refresh.
  const { data } = useActiveCycle();
  const cta = data?.cta ?? null;
  const notice = data?.notice ?? null;

  // Urgent: a form is open for this user → coloured banner with an action.
  if (cta) {
    return (
      <div className="mx-6 mt-4 flex items-center justify-between gap-4 rounded-lg border border-pes-200 bg-pes-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <Notification size={22} className="text-pes-600 shrink-0" variant="Bold" />
          <div>
            <p className="text-sm font-semibold text-pes-700">A stress exercise is open</p>
            <p className="text-sm text-pes-700">{cta.message}</p>
          </div>
        </div>
        <Link
          href={cta.href}
          className="shrink-0 bg-pes text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-pes-800 transition-colors"
        >
          Open the form
        </Link>
      </div>
    );
  }

  // Heads-up: a form is scheduled/coming → quieter informational banner.
  if (notice) {
    return (
      <div className="mx-6 mt-4 flex items-center gap-3 rounded-lg border border-line bg-canvas px-5 py-3">
        <Notification size={20} className="text-muted shrink-0" />
        <p className="text-sm text-body">{notice.message}</p>
      </div>
    );
  }

  return null;
}
