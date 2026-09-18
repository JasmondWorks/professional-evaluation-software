'use client';

// Dashboard notice for the appraisal model. The message is written for the
// reader's role, because one open period means five different things: forms to
// fill, forms to verify, scores to review, a contested score to rule on, or
// departments to chase.
//
// Driven by /api/appraisal-v2/active-period, which returns the single most
// relevant call to action for this person.

import Link from 'next/link';
import { Award } from 'iconsax-react';
import { useAppraisalNotice } from './useAppraisalNotice';

export default function AppraisalPeriodBanner() {
  // Polls and refetches on focus, so this appears without a page refresh.
  const { data } = useAppraisalNotice();
  const cta = data?.cta ?? null;
  const notice = data?.notice ?? null;

  // Their turn: coloured banner with a way straight to the right screen.
  if (cta) {
    return (
      <div className="mx-6 mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-pes-200 bg-pes-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <Award size={22} variant="Bold" className="mt-0.5 shrink-0 text-pes-600" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-pes-700">{cta.title}</p>
            <p className="text-sm text-pes-700">{cta.message}</p>
          </div>
        </div>
        <Link
          href={cta.href}
          className="shrink-0 rounded-md bg-pes px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pes-800"
        >
          {cta.action}
        </Link>
      </div>
    );
  }

  // Worth knowing, but nothing to do: quieter line, no action.
  if (notice) {
    return (
      <div className="mx-6 mt-4 flex items-center gap-3 rounded-lg border border-line bg-canvas px-5 py-3">
        <Award size={20} className="shrink-0 text-muted" />
        <p className="text-sm text-body">{notice.message}</p>
      </div>
    );
  }

  return null;
}
