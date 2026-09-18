'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardBody, CardHeader } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';
import { AppraisalModel, CATEGORY_KEYS, CategoryKey } from '@/app/lib/appraisal/instrument';

type Course = { id: number; title: string; code: string; unit: string };
type Indicator = { id?: number; category: string; label: string; course_id?: number | null };

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  teaching: 'Teaching',
  research: 'Research',
  administration: 'Administration',
  community: 'Community service',
  activity: 'Activity',
  training: 'Training quality',
  fault_solving: 'Fault solving',
};

/** Form 4: which indicators apply to this member of staff.
 *
 *  An indicator is one named piece of work: a course taught, a journal paper, a
 *  book, an administrative post, a community project. Choosing them defines what
 *  the person is actually appraised on, so nothing can be scored until this is
 *  set. Registered courses appear automatically as teaching indicators. */
export default function IndicatorPicker({
  periodId,
  model,
  courses,
}: {
  periodId: number;
  model: AppraisalModel;
  courses: Course[];
}) {
  const [chosen, setChosen] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const categories = CATEGORY_KEYS[model].filter((c) => c !== 'teaching');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/appraisal-v2/indicators?periodId=${periodId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Could not load your indicators.');
        if (!cancelled) setChosen(data.indicators ?? []);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [periodId]);

  const has = (category: string, label: string) =>
    chosen.some((c) => c.category === category && c.label === label);

  function toggleCourse(course: Course) {
    const label = `${course.code} ${course.title}`;
    setChosen((prev) =>
      has('teaching', label)
        ? prev.filter((c) => !(c.category === 'teaching' && c.label === label))
        : [...prev, { category: 'teaching', label, course_id: course.id }],
    );
  }

  function addFree(category: string) {
    const label = (drafts[category] ?? '').trim();
    if (!label) return;
    if (has(category, label)) return;
    setChosen((prev) => [...prev, { category, label }]);
    setDrafts((d) => ({ ...d, [category]: '' }));
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch('/api/appraisal-v2/indicators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodId,
          indicators: chosen.map((c) => ({
            category: c.category,
            label: c.label,
            courseId: c.course_id ?? undefined,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save your indicators.');
      setChosen(data.indicators ?? chosen);
      notify.success('Indicators saved.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pes border-t-transparent" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-strong">What you are appraised on</h2>
        <p className="mt-0.5 text-sm text-muted">
          Tick the work that applies to you this period. Only what you choose here is scored.
        </p>
      </CardHeader>
      <CardBody>
        {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}

        {model === 'academic' ? (
          <div className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Teaching
            </h3>
            {courses.length === 0 ? (
              <p className="text-sm text-body">
                Register a course above and it will appear here to tick.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {courses.map((course) => {
                  const label = `${course.code} ${course.title}`;
                  return (
                    <li key={course.id}>
                      <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                        <input
                          type="checkbox"
                          checked={has('teaching', label)}
                          onChange={() => toggleCourse(course)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-pes"
                        />
                        <span className="min-w-0 text-body">
                          <span className="font-medium text-strong">{course.code}</span>{' '}
                          {course.title}
                          <span className="ml-1 text-muted">({Number(course.unit)} units)</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}

        <div className="space-y-5">
          {categories.map((category) => {
            const rows = chosen.filter((c) => c.category === category);
            return (
              <div key={category}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {CATEGORY_LABELS[category]}
                </h3>

                {rows.length > 0 ? (
                  <ul className="mb-2 space-y-1">
                    {rows.map((r) => (
                      <li
                        key={r.label}
                        className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-1.5 text-sm"
                      >
                        <span className="min-w-0 truncate text-body">{r.label}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setChosen((prev) =>
                              prev.filter((c) => !(c.category === category && c.label === r.label)),
                            )
                          }
                          className="shrink-0 text-xs font-medium text-danger-700 hover:underline"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <input
                    value={drafts[category] ?? ''}
                    onChange={(e) => setDrafts((d) => ({ ...d, [category]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFree(category);
                      }
                    }}
                    placeholder={
                      category === 'research'
                        ? 'Title of a paper, book or patent'
                        : `Name of the ${CATEGORY_LABELS[category].toLowerCase()} work`
                    }
                    aria-label={`Add a ${CATEGORY_LABELS[category]} indicator`}
                    className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-pes-400 focus-visible:shadow-focus"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!(drafts[category] ?? '').trim()}
                    onClick={() => addFree(category)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <Button onClick={save} loading={busy}>
            Save my indicators
          </Button>
          <p className="text-sm text-muted">
            {chosen.length === 0
              ? 'Nothing chosen yet, so nothing would be scored.'
              : `${chosen.length} chosen.`}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
