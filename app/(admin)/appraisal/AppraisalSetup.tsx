'use client';

import { useEffect, useState } from 'react';
import { Alert, Empty } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import PeriodPanel, { Period } from './PeriodPanel';
import TargetEditor from './TargetEditor';
import CourseRegistry from './CourseRegistry';

/** Appraisal setup. The period is the root of the whole flow, so it comes first
 *  and the target editor only appears once one is open. */
export default function AppraisalSetup() {
  const [period, setPeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/appraisal-v2/period');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Could not load the appraisal period.');
        if (!cancelled) setPeriod(data.period);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>

      {error ? (
        <Alert tone="danger" className="mb-6">
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-pes border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          <PeriodPanel period={period} onChange={setPeriod} />

          {period ? (
            <>
              <TargetEditor periodId={period.id} />
              <CourseRegistry periodId={period.id} />
            </>
          ) : (
            <Empty
              title="Targets and courses appear once a period is open"
              description="Every target belongs to a period, so that changing a figure this year never rewrites last year's results."
            />
          )}
        </div>
      )}
    </>
  );
}
