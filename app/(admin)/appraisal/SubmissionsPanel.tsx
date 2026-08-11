'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Badge, Button, Card, CardBody, CardHeader, Empty } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';

type Dept = {
  dept: string;
  total: number;
  submitted: number;
  deanApproved: number;
  waiting: string[];
};

/** Who has not yet submitted. The model requires the HOD to see this for their
 *  own department, and Estab./Personnel to see which departments are still
 *  outstanding before the final evaluation runs. */
export default function SubmissionsPanel() {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [depts, setDepts] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      const pRes = await apiFetch('/api/appraisal-v2/period');
      const pData = await pRes.json();
      if (!pRes.ok) throw new Error(pData.error);
      if (!pData.period) {
        setPeriodId(null);
        return;
      }
      setPeriodId(pData.period.id);
      const res = await apiFetch(`/api/appraisal-v2/outstanding?periodId=${pData.period.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDepts(data.departments);
    } catch (err: any) {
      setError(err.message ?? 'Could not load submissions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(dept: string) {
    setBusy(dept);
    setError(null);
    try {
      const res = await apiFetch('/api/appraisal-v2/dean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId, dept }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify.success(`${dept} approved.`);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  const totalWaiting = depts.reduce((s, d) => s + d.waiting.length, 0);

  return (
    <>

      {error ? <Alert tone="danger" className="mb-6">{error}</Alert> : null}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-pes border-t-transparent" />
        </div>
      ) : !periodId ? (
        <Empty
          title="No appraisal period is open"
          description="Submissions belong to a period. Open one in Appraisal Setup to begin."
          action={
            <Link href="/appraisal">
              <Button variant="secondary">Go to Appraisal Setup</Button>
            </Link>
          }
        />
      ) : depts.length === 0 ? (
        <Empty
          title="Nobody is being appraised yet"
          description="Start an appraisal and its department will appear here."
          action={
            <Link href="/appraisal/entries">
              <Button variant="secondary">Go to appraisals</Button>
            </Link>
          }
        />
      ) : (
        <>
          {totalWaiting > 0 ? (
            <Alert tone="warning" className="mb-6">
              {totalWaiting} member{totalWaiting === 1 ? '' : 's'} of staff have not submitted yet.
            </Alert>
          ) : (
            <Alert tone="success" className="mb-6">
              Everyone has submitted.
            </Alert>
          )}

          <div className="space-y-4">
            {depts.map((d) => {
              const ready = d.waiting.length === 0;
              const approved = d.deanApproved === d.total && d.total > 0;
              return (
                <Card key={d.dept}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold text-strong">{d.dept}</h2>
                        <p className="mt-0.5 text-sm text-muted">
                          {d.submitted} of {d.total} submitted
                        </p>
                      </div>
                      {approved ? (
                        <Badge tone="success">Approved by the Dean</Badge>
                      ) : (
                        <Badge tone={ready ? 'brand' : 'warning'}>
                          {ready ? 'Ready for approval' : 'Waiting on staff'}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardBody>
                    {d.waiting.length > 0 ? (
                      <div className="mb-4">
                        <p className="mb-1.5 text-xs uppercase tracking-wide text-muted">
                          Yet to submit
                        </p>
                        <ul className="flex flex-wrap gap-2">
                          {d.waiting.map((name) => (
                            <li
                              key={name}
                              className="rounded-lg border border-line px-2.5 py-1 text-sm text-body"
                            >
                              {name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {!approved ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          size="sm"
                          onClick={() => approve(d.dept)}
                          disabled={!ready}
                          loading={busy === d.dept}
                        >
                          Approve this department
                        </Button>
                        {/* AGENTS.md: a disabled control must say why on screen. */}
                        {!ready ? (
                          <p className="text-sm text-muted">
                            {d.waiting.length} member{d.waiting.length === 1 ? '' : 's'} of staff
                            still to submit.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
