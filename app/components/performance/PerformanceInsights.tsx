'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Empty, Skeleton } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { CRITERIA } from '@/app/lib/performance/instrument';
import type { PerformanceOverview } from '@/app/lib/performance/results';

// Performance insights on the dashboard.
//
// The previous card had "Employees" and "Teams" tabs over a list of good and bad
// yields. Employees vs teams is a maintenance-model distinction; the performance
// model measures one staff member at a time against a target, so there is nothing
// to switch between and the tabs are gone.

export default function PerformanceInsights() {
  const [overview, setOverview] = useState<PerformanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/performance-v2/stats');
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) setError(data.error ?? 'Could not load performance figures.');
        else setOverview(data.overview);
      } catch {
        if (!cancelled) setError('Could not reach the server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger-100 bg-danger-50 p-3 text-sm text-danger-700" role="alert">
        {error}
      </div>
    );
  }

  if (!overview?.period) {
    return (
      <Empty
        title="No performance period yet"
        description="Open a period in the performance model and staff results will appear here."
      />
    );
  }

  const { period, target, expected, evaluated, meanOverall, atOrAboveTarget, belowTarget, criteria, topDepartment } =
    overview;
  const onTarget = meanOverall !== null && meanOverall >= target;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <span className="capitalize font-medium text-strong">{period.frequency} period</span>
        <Badge tone={period.status === 'open' ? 'success' : 'neutral'}>{period.status}</Badge>
        {period.released ? <Badge tone="brand">Released</Badge> : null}
        <span className="tabular-nums">
          {period.starts_on} to {period.ends_on}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tile
          label="Mean overall"
          value={meanOverall === null ? '—' : meanOverall.toFixed(1)}
          note={`target ${target}`}
          tone={meanOverall === null ? 'neutral' : onTarget ? 'success' : 'warning'}
        />
        <Tile
          label="Evaluated"
          value={`${evaluated}`}
          note={`of ${expected} with a record`}
          tone="neutral"
        />
        <Tile
          label="At or above target"
          value={`${atOrAboveTarget}`}
          note={evaluated ? `${Math.round((atOrAboveTarget / evaluated) * 100)}% of those evaluated` : undefined}
          tone="success"
        />
        <Tile label="Below target" value={`${belowTarget}`} tone="warning" />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted">Mean by criterion</p>
        <ul className="flex flex-col gap-2">
          {CRITERIA.map((c) => {
            const value = criteria[c.key];
            return (
              <li key={c.key} className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-sm text-body">{c.label}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-line/60">
                  <span
                    className="block h-full rounded-full bg-pes transition-[width] duration-500"
                    style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right text-sm tabular-nums text-strong">
                  {value === null ? '—' : value.toFixed(1)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {topDepartment ? (
          <p className="text-sm text-muted">
            Strongest department:{' '}
            <span className="font-medium text-strong">{topDepartment.dept}</span>{' '}
            <span className="tabular-nums">({topDepartment.mean.toFixed(1)})</span>
          </p>
        ) : (
          <span />
        )}
        <Link href="/models/performance" className="text-sm font-medium text-pes hover:underline">
          Open the performance model →
        </Link>
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  success: 'border-success-100 bg-success-50 text-success-700',
  warning: 'border-warning-100 bg-warning-50 text-warning-700',
  neutral: 'border-line bg-canvas text-strong',
};

function Tile({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone: 'success' | 'warning' | 'neutral';
}) {
  return (
    <div className={`rounded-lg border p-4 ${TONES[tone]}`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      {note ? <p className="mt-1 text-xs opacity-70">{note}</p> : null}
    </div>
  );
}
