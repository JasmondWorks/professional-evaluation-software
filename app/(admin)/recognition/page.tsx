'use client';

// The recognition hub.
//
// This replaced three sidebar labels — Hall of Fame, 1st Book of Records, 2nd
// Book of Records — which cost every role three rail slots for pages nobody
// opens daily. A page of three links would just be a worse rail, so each row
// carries what a label could not: how many of the organization's staff are in
// it, the grade that earns a place, and whether the reader is already there.
//
// A list with rules rather than a grid of equal cards: these are four
// destinations of differing weight, read top to bottom, and the counts line up
// in a column where tabular figures can be compared.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight2 } from 'iconsax-react';
import { Alert, Badge, PageHeader, Skeleton } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { useCurrentUser } from '@/app/components/useCurrentUser';

type Standing = { total: number; includesMe: boolean };

type Summary = {
  hallOfFame: Standing;
  firstBook: Standing;
  secondBook: Standing;
};

/** The rows, in the order the document ranks them: the Hall of Fame is the
 *  highest honour, then the 1st Book, then the 2nd. */
const ROWS = [
  {
    key: 'hallOfFame' as const,
    name: 'Hall of Fame',
    href: '/hall-of-fame',
    earns: 'Very Outstanding over three years',
    blurb:
      'The organization’s highest recognition. Awarded on three-year overall performance, not a single year.',
  },
  {
    key: 'firstBook' as const,
    name: '1st Book of Records',
    href: '/book-of-record/performance',
    earns: 'Excellent over three years',
    blurb: 'Staff whose three-year overall performance reached Excellent.',
  },
  {
    key: 'secondBook' as const,
    name: '2nd Book of Records',
    href: '/book-of-record/second/performance',
    earns: 'Very Good over three years',
    blurb: 'Staff whose three-year overall performance reached Very Good.',
  },
];

export default function RecognitionPage() {
  const { user } = useCurrentUser();
  // A platform operator belongs to no organization by design, so there is no
  // organization whose Hall of Fame and Books of Records this could show. The
  // rail no longer offers them the page; this covers arriving at the URL
  // anyway, and explains the situation instead of reporting their own account
  // as broken.
  const isPlatformOperator = user?.role === 'super-admin';

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPlatformOperator) {
      setLoading(false);
      return;
    }
    let live = true;
    (async () => {
      try {
        const res = await apiFetch('/api/recognition', { method: 'GET' });
        const body = await res.json();
        if (!live) return;
        if (!res.ok) throw new Error(body.error ?? 'Could not load recognition.');
        setSummary(body);
      } catch (err: any) {
        if (live) setError(err.message);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [isPlatformOperator]);

  if (isPlatformOperator) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <PageHeader
          title="Recognition"
          subtitle="Each organization's own Hall of Fame and Books of Records."
        />
        <p className="max-w-prose text-sm text-body">
          You are signed in as the platform operator, which belongs to no single
          organization — and recognition is always one organization's own. Open an
          organization from{' '}
          <Link href="/organizations" className="text-pes underline">
            All Organizations
          </Link>{' '}
          to see its staff and records.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Recognition"
        subtitle="Who the organization has honoured, and what each honour takes to earn."
      />

      {error ? (
        <Alert tone="danger" className="mb-6">
          {error}
        </Alert>
      ) : null}

      <ul className="divide-y divide-line border-y border-line">
        {ROWS.map((row) => {
          const standing = summary?.[row.key];
          return (
            <li key={row.key}>
              <Link
                href={row.href}
                className="group flex items-center gap-4 py-5 transition-colors hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-strong group-hover:text-pes">
                      {row.name}
                    </span>
                    {standing?.includesMe ? <Badge tone="success">You are in this</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-body">{row.blurb}</p>
                  <p className="mt-1 text-xs text-muted">Earned by {row.earns}.</p>
                </div>

                <div className="w-20 shrink-0 text-right">
                  {loading ? (
                    <Skeleton className="ml-auto h-6 w-10" />
                  ) : (
                    <>
                      <div className="text-lg font-semibold tabular-nums text-strong">
                        {standing?.total ?? 0}
                      </div>
                      <div className="text-xs text-muted">
                        {standing?.total === 1 ? 'entry' : 'entries'}
                      </div>
                    </>
                  )}
                </div>

                <ArrowRight2
                  size={18}
                  className="shrink-0 text-muted group-hover:text-pes"
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-sm text-muted">
        Your own certificates and badges are on{' '}
        <Link href="/my-awards" className="text-pes underline">
          My Awards
        </Link>
        .
      </p>
    </div>
  );
}
