'use client';

// The platform closes when an organization's subscription lapses.
//
// The client, 9 September: the app is bought once from the website, and
// everything after that is a yearly subscription. When the year runs out the
// organization loses the product until its administrator renews — not a
// smaller plan, no product.
//
// This blocks the signed-in surface for every role. It is not the enforcement:
// resolveEntitlements withdraws every entitlement on a lapse, so the models
// refuse server-side whatever the browser is showing. This is what makes the
// refusal legible instead of arriving as a wall of 402s.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/app/utils/apiFetch';
import { getAccessToken } from '@/app/utils/auth';

type State = {
  active: boolean;
  expiresAt: string | null;
  daysLeft: number | null;
  canRenew: boolean;
  warn: boolean;
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!getAccessToken()) {
      setChecked(true);
      return;
    }
    (async () => {
      try {
        const res = await apiFetch('/api/subscription-state');
        const data = await res.json();
        if (!cancelled && res.ok) setState(data);
      } catch {
        // A failed check must not lock anyone out: the server still refuses
        // every model on a lapse, so failing open here costs nothing and
        // failing closed would strand an organization over a dropped request.
      } finally {
        if (!cancelled) setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing is hidden while the answer is unknown — the page renders as usual
  // and the block appears only once we are certain.
  if (!checked || !state || state.active) {
    return (
      <>
        {state?.warn && <RenewalWarning state={state} />}
        {children}
      </>
    );
  }

  const lapsed = formatDate(state.expiresAt);

  return (
    <div className="flex-1 flex items-center justify-center p-8 min-h-screen bg-canvas">
      <div className="max-w-lg w-full bg-surface border border-line rounded-2xl shadow-card p-10 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-danger-50 flex items-center justify-center mb-5">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="text-danger-600"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-strong mb-2">
          {state.canRenew
            ? 'Payment plan has expired for your organization'
            : 'Payment plan has expired for your organization, please contact your admin'}
        </h1>

        <p className="text-sm text-muted leading-relaxed max-w-sm mx-auto">
          {lapsed ? `Access ended on ${lapsed}. ` : ''}
          {state.canRenew
            ? 'Renew the subscription to restore the models, evaluations and records for everyone in your organization. Nothing has been deleted.'
            : 'Your organization administrator can renew it. Nothing has been deleted — everything returns as soon as the subscription is active again.'}
        </p>

        {state.canRenew && (
          <Link
            href="/pricing"
            className="mt-7 inline-flex items-center justify-center h-11 px-6 rounded-lg bg-pes text-white text-sm font-medium hover:bg-pes-800 transition-colors"
          >
            Renew now
          </Link>
        )}
      </div>
    </div>
  );
}

/** Shown for the last fortnight before the lock, so a renewal can happen
 *  before anyone is locked out rather than after. */
function RenewalWarning({ state }: { state: State }) {
  const days = state.daysLeft ?? 0;
  const when = days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;

  return (
    <div className="bg-warning-50 border-b border-warning-100 px-4 py-2.5">
      <p className="text-sm text-warning-700 text-center">
        Your organization&apos;s payment plan expires {when}.{' '}
        {state.canRenew ? (
          <Link href="/pricing" className="font-semibold underline underline-offset-2">
            Renew now
          </Link>
        ) : (
          'Ask your administrator to renew it.'
        )}
      </p>
    </div>
  );
}
