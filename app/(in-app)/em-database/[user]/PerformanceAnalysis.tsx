'use client';

// Every result PES actually holds for one employee: appraisal, performance,
// stress submission + Form 5 category scores, and achievements. Sections whose
// data has not been submitted say so — nothing here is placeholder.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, ClipboardList, Gauge, HeartPulse } from 'lucide-react';
import { apiFetch } from '@/app/utils/apiFetch';
import { Alert, Badge, Card, CardBody, CardHeader, Empty, Progress, Skeleton } from '@/app/components/ui';
import { band, pct } from '@/app/components/utils/grading';

type Scored = { label: string; value: number | null };

type Results = {
  appraisal: Record<string, any> | null;
  performance: Record<string, any> | null;
  stress: Record<string, any> | null;
  stressScores: { categories: Scored[]; dept?: string | null; cycle_id?: number | null } | null;
};

/** One measured row: label, figure, band. The band is the shared /performance banding. */
function ScoreRow({ label, value }: Scored) {
  const shown = pct(value);
  const b = shown !== null ? band(Number(value)) : null;

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-line last:border-0">
      <p className="text-sm text-body min-w-0 flex-1">{label}</p>
      {shown === null ? (
        <p className="text-sm text-muted">Not scored</p>
      ) : (
        <>
          <p className={`text-sm font-semibold tabular-nums w-20 text-right ${b!.text}`}>{shown}</p>
          <div className="w-32 hidden sm:flex justify-end">
            <Badge tone={b!.tone}>{b!.label}</Badge>
          </div>
        </>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  meta,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-strong">
          <span className="text-muted">{icon}</span>
          {title}
        </h2>
        {meta}
      </CardHeader>
      <CardBody className="py-1">{children}</CardBody>
    </Card>
  );
}

// The stress submission's position in the two-tier approval workflow.
function stressStatus(s: Record<string, any>) {
  if (s.rejected) return { tone: 'danger' as const, label: 'Returned for re-entry' };
  if (s.approved) return { tone: 'success' as const, label: 'Approved' };
  if (s.hod_approved) return { tone: 'warning' as const, label: 'Awaiting faculty sign-off' };
  return { tone: 'neutral' as const, label: 'Awaiting HOD approval' };
}

export default function PerformanceAnalysis({
  staffId,
  staffName,
}: {
  staffId: number;
  staffName: string;
}) {
  const [results, setResults] = useState<Results | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!staffId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch('/api/employee-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: staffId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
        if (!cancelled) setResults(data);

        if (staffName) {
          const aRes = await apiFetch('/api/achievements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: staffName }),
          });
          const aData = await aRes.json();
          if (!cancelled) setAchievements(Array.isArray(aData) ? aData : []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load results.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [staffId, staffName]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              {[0, 1, 2, 3].map((r) => (
                <Skeleton key={r} className="h-4 w-full" />
              ))}
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert tone="danger" title="Results could not be loaded">
        {error}
      </Alert>
    );
  }

  const appraisal = results?.appraisal;
  const performance = results?.performance;
  const stress = results?.stress;
  const stressScores = results?.stressScores;

  const appraisalRows: Scored[] = appraisal
    ? [
        { label: 'Teaching quality', value: appraisal.teaching },
        { label: 'Research quality', value: appraisal.research },
        { label: 'Administrative quality', value: appraisal.administrative },
        { label: 'Community quality', value: appraisal.community },
      ]
    : [];
  const appraisalScored = appraisalRows.filter((r) => r.value !== null && r.value !== undefined);
  const appraisalTotal = appraisalScored.reduce((sum, r) => sum + Number(r.value), 0);
  const appraisalAvg = appraisalScored.length ? appraisalTotal / appraisalScored.length : null;

  const performanceRows: Scored[] = performance
    ? [
        { label: 'Competence', value: performance.competence },
        { label: 'Integrity', value: performance.integrity },
        { label: 'Compatibility', value: performance.compatibility },
        { label: 'Use of resources', value: performance.use_of_resources },
      ]
    : [];

  const categories = (stressScores?.categories ?? []).filter(
    (c) => c.value !== null && Number(c.value) > 0,
  );
  const categoryMax = categories.reduce((m, c) => Math.max(m, Number(c.value)), 0);
  const sortedCategories = [...categories].sort((a, b) => Number(b.value) - Number(a.value));

  const nothingAtAll = !appraisal && !performance && !stress && !stressScores;

  if (nothingAtAll) {
    return (
      <Empty
        icon={<ClipboardList size={22} />}
        title="No results recorded yet"
        description={`${staffName || 'This employee'} has no appraisal, performance or stress submission on record. Results appear here once the assessments are submitted and scored.`}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Section
        icon={<ClipboardList size={16} />}
        title="Appraisal"
        meta={
          appraisalAvg !== null ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">
                Average{' '}
                <span className={`font-semibold tabular-nums ${band(appraisalAvg).text}`}>
                  {appraisalAvg.toFixed(2)}%
                </span>
              </span>
              <Badge tone={band(appraisalAvg).tone}>{band(appraisalAvg).short}</Badge>
            </div>
          ) : appraisal?.pending ? (
            <Badge tone="warning">Pending review</Badge>
          ) : undefined
        }
      >
        {appraisal ? (
          appraisalRows.map((row) => <ScoreRow key={row.label} {...row} />)
        ) : (
          <p className="py-4 text-sm text-muted">
            No appraisal has been submitted for this employee yet.
          </p>
        )}
      </Section>

      <Section
        icon={<Gauge size={16} />}
        title="Performance"
        meta={performance?.pending ? <Badge tone="warning">Pending review</Badge> : undefined}
      >
        {performance ? (
          performanceRows.map((row) => <ScoreRow key={row.label} {...row} />)
        ) : (
          <p className="py-4 text-sm text-muted">
            No performance scores have been recorded for this employee yet.
          </p>
        )}
      </Section>

      <Section
        icon={<HeartPulse size={16} />}
        title="Stress evaluation"
        meta={
          stress ? (
            <div className="flex items-center gap-2">
              {stress.cycle_id ? (
                <span className="text-xs text-muted tabular-nums">Cycle {stress.cycle_id}</span>
              ) : null}
              <Badge tone={stressStatus(stress).tone}>{stressStatus(stress).label}</Badge>
            </div>
          ) : undefined
        }
      >
        {stress || sortedCategories.length ? (
          <div className="py-2 flex flex-col gap-5">
            {stress?.rejected && stress.rejection_reason && (
              <Alert tone="danger" title="Returned to the employee">
                {stress.rejection_reason}
              </Alert>
            )}

            {stress && (
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                {[
                  ['Stress theme', stress.theme],
                  ['Feeling frequency', stress.feeling_frequency],
                  ['Stress category', stress.category],
                  ['Theme (form)', stress.theme_form],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <dt className="text-xs text-muted">{label as string}</dt>
                    <dd className="text-base font-semibold text-strong tabular-nums">
                      {value === null || value === undefined ? '—' : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {sortedCategories.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted mb-3">
                  Reported stress by category
                </p>
                <div className="flex flex-col gap-2.5">
                  {sortedCategories.map((c) => (
                    <div key={c.label} className="flex items-center gap-3">
                      <span className="text-sm text-body w-44 shrink-0 truncate">{c.label}</span>
                      <Progress
                        value={categoryMax ? (Number(c.value) / categoryMax) * 100 : 0}
                        className="flex-1"
                      />
                      <span className="text-sm text-strong tabular-nums w-12 text-right">
                        {Number(c.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="py-4 text-sm text-muted">
            This employee has not submitted a stress assessment for the current cycle.
          </p>
        )}
      </Section>

      <Section icon={<Award size={16} />} title="Achievements">
        {achievements.length ? (
          <ul className="py-2 flex flex-col divide-y divide-line">
            {achievements.map((a, i) => (
              <li key={`${a.source}-${a.id ?? i}`} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-strong truncate">
                    {a.name || a.title || a.category || 'Achievement'}
                  </p>
                  <p className="text-xs text-muted capitalize">
                    {String(a.source || '').replace(/_/g, ' ')}
                  </p>
                </div>
                {a.url && (
                  <Link
                    href={a.url}
                    className="text-sm font-medium text-pes-700 hover:text-pes-800 shrink-0"
                  >
                    View
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-muted">
            No records, badges or hall-of-fame entries for this employee yet.
          </p>
        )}
      </Section>
    </div>
  );
}
