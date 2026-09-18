'use client';

import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, CardBody, CardHeader, Empty } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';

type Dept = {
  dept: string;
  total: number;
  submitted: number;
  verified: number;
  deanApproved: number;
  waiting: string[];
};

/** Who has not yet submitted. The model requires the HOD to see this for their
 *  own department, and Estab./Personnel to see which departments are still
 *  outstanding before the final evaluation runs. */
/** `onGoToSetup` moves to the Setup tab. These empty states used to link to
 *  /appraisal — the staff and departmental forms area, which the organization
 *  admin cannot open — so the button led to the unauthorized page. */
export default function SubmissionsPanel({ onGoToSetup }: { onGoToSetup?: () => void } = {}) {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [depts, setDepts] = useState<Dept[]>([]);
  // The client asked to see departments first and open one at a time, rather
  // than every staff member across the organization at once.
  const [openDept, setOpenDept] = useState<string | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
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

      // Staff rows for the drill-down, fetched once and filtered per department.
      const eRes = await apiFetch(`/api/appraisal-v2/entry?periodId=${pData.period.id}`);
      const eData = await eRes.json();
      if (eRes.ok) setStaff(eData.entries ?? []);
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
          description="Submissions belong to a period. Open one in Setup to begin."
          action={
            onGoToSetup ? (
              <Button variant="secondary" onClick={onGoToSetup}>
                Go to Setup
              </Button>
            ) : undefined
          }
        />
      ) : depts.length === 0 ? (
        <Empty
          title="Nobody is being appraised yet"
          description="A department appears here as soon as its staff begin entering scores."
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
              // Ready means verified, not merely submitted: the departmental
              // administrator checks Forms 8 and 9 before anything moves on.
              const ready = d.waiting.length === 0 && d.verified === d.total;
              const approved = d.deanApproved === d.total && d.total > 0;
              return (
                <Card key={d.dept}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        aria-expanded={openDept === d.dept}
                        onClick={() => setOpenDept(openDept === d.dept ? null : d.dept)}
                        className="min-w-0 text-left focus:outline-none focus-visible:shadow-focus"
                      >
                        <h2 className="text-base font-semibold text-strong hover:text-pes">
                          {d.dept}
                        </h2>
                        <p className="mt-0.5 text-sm text-muted">
                          {d.submitted} of {d.total} submitted, {d.verified} verified ·{' '}
                          {openDept === d.dept ? 'hide staff' : 'view staff'}
                        </p>
                      </button>
                      {approved ? (
                        <Badge tone="success">Approved by the Dean</Badge>
                      ) : (
                        <Badge tone={ready ? 'brand' : 'warning'}>
                          {ready
                            ? 'Ready for approval'
                            : d.waiting.length > 0
                              ? 'Waiting on staff'
                              : 'Awaiting departmental verification'}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardBody>
                    {openDept !== d.dept ? null : (
                      <div className="mb-4 overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-line bg-canvas">
                              {['Staff member', 'Forms entered', 'Status'].map((h) => (
                                <th
                                  key={h}
                                  className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-line">
                            {staff
                              .filter((e) => (e.dept ?? 'Unassigned') === d.dept)
                              .map((e) => (
                                <tr key={e.id}>
                                  <td className="px-3 py-2 font-medium text-strong">
                                    {e.pesuser_name}
                                  </td>
                                  <td className="px-3 py-2 tabular-nums text-body">
                                    {e.formsCompleted} of {e.model === 'academic' ? 5 : 3}
                                  </td>
                                  <td className="px-3 py-2 text-body">
                                    {e.submitted_at ? 'Submitted' : 'Not submitted'}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}

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
