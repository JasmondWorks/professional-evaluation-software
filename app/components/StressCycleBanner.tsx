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

  if (!cta) return null;

  return (
    <div className="mx-6 mt-4 flex items-center justify-between gap-4 rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <Notification size={22} className="text-indigo-600 shrink-0" variant="Bold" />
        <div>
          <p className="text-sm font-semibold text-indigo-900">A stress exercise is open</p>
          <p className="text-sm text-indigo-800">{cta.message}</p>
        </div>
      </div>
      <Link
        href={cta.href}
        className="shrink-0 bg-pes text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-900 transition-colors"
      >
        Open the form
      </Link>
    </div>
  );
}
