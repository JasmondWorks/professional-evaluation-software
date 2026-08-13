'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft2 } from 'iconsax-react';
import { Alert, Empty, PageHeader } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import CourseRegistry from '../CourseRegistry';
import IndicatorPicker from './IndicatorPicker';
import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from '@/app/utils/auth';
import { modelFor } from '@/app/lib/appraisal/instrument';

/** The courses a member of staff teaches this period.
 *
 *  Registered by staff themselves rather than by the organization
 *  administrator, per the client on 11 Aug. Course units feed the teaching
 *  quantity, so this has to exist before teaching can be scored. */
export default function CoursesPage() {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Academic staff in an academic institution get the four-category model; the
  // indicator list follows from that.
  const [model, setModel] = useState<'academic' | 'non_academic'>('non_academic');
  useEffect(() => {
    const t = getAccessToken();
    if (!t) return;
    try {
      const c: any = jwtDecode(t);
      setModel(modelFor(c?.productCategory ?? 'academic', c?.role === 'lecturer' ? 'academic' : 'non_academic'));
    } catch {
      /* leave the default */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/appraisal-v2/period');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Could not load the appraisal period.');
        if (!cancelled) setPeriodId(data.period?.id ?? null);
        if (data.period?.id) {
          const cRes = await apiFetch(`/api/appraisal-v2/courses?periodId=${data.period.id}`);
          const cData = await cRes.json();
          if (!cancelled && cRes.ok) setCourses(cData.courses ?? []);
        }
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
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <Link
        href="/appraisal/entries"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-pes"
      >
        <ArrowLeft2 size={16} /> Back to appraisals
      </Link>

      <PageHeader
        title="Your courses and indicators"
        subtitle="Register the courses you teach, then tick everything you should be appraised on this period."
      />

      {error ? <Alert tone="danger" className="mb-6">{error}</Alert> : null}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-pes border-t-transparent" />
        </div>
      ) : periodId ? (
        <div className="space-y-6">
          <CourseRegistry periodId={periodId} />
          <IndicatorPicker periodId={periodId} model={model} courses={courses} />
        </div>
      ) : (
        <Empty
          title="No appraisal period is open"
          description="Courses belong to a period. Once your organization opens one, you can register the courses you teach."
        />
      )}
    </div>
  );
}
