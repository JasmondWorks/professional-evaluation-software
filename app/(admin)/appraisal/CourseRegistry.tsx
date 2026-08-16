'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardBody, CardHeader, Field } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';

type Course = { id: number; title: string; code: string; unit: string; dept: string | null };

const input =
  'block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition-shadow focus:border-pes-400 focus-visible:shadow-focus';

/** Form 2, the course registry. Course units feed the teaching quantity, so a
 *  course has to exist here before a lecturer can be appraised on it. */
export default function CourseRegistry({ periodId }: { periodId: number }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [unit, setUnit] = useState('');

  async function load() {
    try {
      const res = await apiFetch(`/api/appraisal-v2/courses?periodId=${periodId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCourses(data.courses);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [periodId]);

  const ready = title.trim() !== '' && code.trim() !== '' && Number(unit) > 0;

  async function add() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch('/api/appraisal-v2/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId, title, code, unit: Number(unit) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify.success(`${code} registered.`);
      setTitle('');
      setCode('');
      setUnit('');
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    await apiFetch(`/api/appraisal-v2/courses?id=${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-strong">Courses</h2>
        <p className="mt-0.5 text-sm text-muted">
          Fifteen semester hours of theory is one unit, forty-five hours of practical is one
          unit. Units feed the teaching quantity directly.
        </p>
      </CardHeader>
      <CardBody>
        {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Field label="Course title">
              {(f) => (
                <input id={f.id} className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
              )}
            </Field>
          </div>
          <Field label="Code">
            {(f) => (
              <input id={f.id} className={input} value={code} onChange={(e) => setCode(e.target.value)} />
            )}
          </Field>
          <Field label="Units">
            {(f) => (
              <input
                id={f.id}
                type="number"
                min={0}
                step="0.5"
                className={input}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            )}
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => (ready ? add() : setError("A course needs a title, a code, and units above zero."))}
            aria-disabled={!ready}
            className={!ready ? "opacity-50" : undefined}
            loading={busy}
          >
            Add course
          </Button>
          {/* AGENTS.md: a disabled control must say why on screen. */}
          {!ready ? (
            <p className="text-sm text-muted">
              A course needs a title, a code, and units above zero.
            </p>
          ) : null}
        </div>

        <div className="mt-5 border-t border-line pt-4">
          {loading ? (
            <p className="text-sm text-muted">Loading courses.</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-muted">
              No courses registered for this period yet.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {courses.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-strong">
                      {c.code} · {c.title}
                    </p>
                    <p className="text-xs text-muted">
                      {Number(c.unit)} unit{Number(c.unit) === 1 ? '' : 's'}
                      {c.dept ? ` · ${c.dept}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
                    className="text-sm font-medium text-danger-700 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
