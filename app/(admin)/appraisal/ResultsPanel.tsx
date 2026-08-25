'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Alert, Badge, Button, Card, CardBody, CardHeader, Empty,
} from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';
import DataIntegrityPanel, { DataIntegrityHandle } from '@/app/components/DataIntegrityPanel';
import { useIsAcademicOrg } from '@/app/lib/useOrgCategory';

type Period = {
  id: number;
  status: string;
  starts_on: string;
  ends_on: string;
  released_at: string | null;
  released_by: string | null;
};

type Entry = {
  id: number;
  pesuser_name: string;
  dept: string | null;
  model: string;
  status: string;
  rtp: string | null;
  grade: string | null;
  partial_target: boolean;
  flagged?: boolean;
};

const GRADE_TONE: Record<string, 'success' | 'brand' | 'neutral' | 'warning' | 'danger'> = {
  Excellent: 'success',
  'Very Good': 'brand',
  Good: 'neutral',
  Fair: 'warning',
  Poor: 'danger',
};

/** `onGoToSetup` moves to the Setup tab of the same page. The empty states used
 *  to link to /appraisal, which is the staff and departmental forms area — the
 *  organization admin has no access to it, so the button sent them straight to
 *  the unauthorized page. */
export default function ResultsPanel({ onGoToSetup }: { onGoToSetup?: () => void } = {}) {
  const [period, setPeriod] = useState<Period | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const integrity = useRef<DataIntegrityHandle>(null);
  // Which appraisal a person sat only distinguishes anything where both kinds of
  // staff exist. Elsewhere the column would read "Non-academic" on every row.
  const isAcademicOrg = useIsAcademicOrg();

  async function load() {
    try {
      const pRes = await apiFetch('/api/appraisal-v2/period');
      const pData = await pRes.json();
      if (!pRes.ok) throw new Error(pData.error);
      setPeriod(pData.period);
      if (pData.period) {
        const eRes = await apiFetch(`/api/appraisal-v2/entry?periodId=${pData.period.id}`);
        const eData = await eRes.json();
        if (eRes.ok) setEntries(eData.entries);
      }
    } catch (err: any) {
      setError(err.message ?? 'Could not load results.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /** Run the model over one department, or over everyone when no department is
   *  given. The client asked to evaluate the departments that are ready rather
   *  than waiting for the whole organization. */
  async function evaluate(dept?: string) {
    const targets = dept ? entries.filter((e) => (e.dept ?? 'Unassigned') === dept) : entries;
    setBusy(dept ?? 'evaluate');
    setError(null);
    try {
      for (const e of targets) {
        await apiFetch('/api/appraisal-v2/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entryId: e.id }),
        });
      }
      notify.success(
        dept
          ? `Evaluated ${targets.length} in ${dept}.`
          : `Evaluated ${targets.length} appraisals.`,
      );
      load();
      // The client asked for the integrity test to follow an evaluation without
      // being asked for, so a bad submission surfaces before results go out.
      integrity.current?.run();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  // A department is ready once everyone in it has submitted.
  const departments = [...new Set(entries.map((e) => e.dept ?? 'Unassigned'))].sort().map((dept) => {
    const rows = entries.filter((e) => (e.dept ?? 'Unassigned') === dept);
    return {
      dept,
      total: rows.length,
      evaluated: rows.filter((e) => e.rtp !== null).length,
      ready: rows.every((e) => e.status !== 'draft'),
    };
  });

  async function release() {
    if (!period) return;
    setBusy('release');
    setError(null);
    try {
      const res = await apiFetch('/api/appraisal-v2/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId: period.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify.success('Results released. Staff can now see their grade.');
      setPeriod(data.period);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  const evaluated = entries.filter((e) => e.rtp !== null).length;
  const flagged = entries.filter((e) => e.flagged).length;
  const outstanding = entries.filter((e) => e.status === 'draft' || e.status === 'awaiting_staff').length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-pes border-t-transparent" />
      </div>
    );
  }

  return (
    <>

      {error ? <Alert tone="danger" className="mb-6">{error}</Alert> : null}

      {!period ? (
        <Empty
          title="No appraisal period"
          description="Results belong to a period. Open one in Setup to begin."
          action={
            onGoToSetup ? (
              <Button variant="secondary" onClick={onGoToSetup}>
                Go to Setup
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-strong">
                {period.released_at ? 'Results released' : 'Not yet released'}
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                {period.released_at
                  ? `Released on ${new Date(period.released_at).toLocaleString()}${
                      period.released_by ? ` by ${period.released_by}` : ''
                    }. Staff can see their grade.`
                  : 'Staff and heads of department cannot see a grade until you release it.'}
              </p>
            </CardHeader>
            <CardBody>
              <div className="mb-4 flex flex-wrap gap-6 text-sm">
                <Stat label="Appraisals" value={entries.length} />
                <Stat label="Evaluated" value={evaluated} />
                <Stat label="Still open" value={outstanding} />
                <Stat label="Flagged for the auditor" value={flagged} />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => evaluate()}
                  disabled={entries.length === 0}
                  loading={busy === 'evaluate'}
                >
                  Run evaluation
                </Button>
                <Button
                  onClick={release}
                  disabled={period.status !== 'closed' || !!period.released_at || evaluated === 0}
                  loading={busy === 'release'}
                >
                  Release results
                </Button>
              </div>

              {/* AGENTS.md: a disabled control must say why on screen. */}
              {period.released_at ? null : period.status !== 'closed' ? (
                <p className="mt-3 text-sm text-muted">
                  Close the period in Appraisal Setup before releasing. Closing ends data entry.
                </p>
              ) : evaluated === 0 ? (
                <p className="mt-3 text-sm text-muted">
                  Run the evaluation first so there is something to release.
                </p>
              ) : flagged > 0 ? (
                <p className="mt-3 text-sm text-muted">
                  {flagged} appraisal{flagged === 1 ? ' is' : 's are'} still with the auditor.
                  Releasing now publishes the rest.
                </p>
              ) : null}
            </CardBody>
          </Card>

          <DataIntegrityPanel ref={integrity} model="appraisal" periodId={period.id} />

          {departments.length > 0 ? (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-strong">By department</h2>
                <p className="mt-0.5 text-sm text-muted">
                  Run the model for a department once everyone in it has submitted.
                </p>
              </CardHeader>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-line bg-canvas">
                        {['Department', 'Appraisals', 'Evaluated', ''].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs uppercase tracking-wide text-muted">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {departments.map((d) => (
                        <tr key={d.dept}>
                          <td className="px-4 py-3 font-medium text-strong">{d.dept}</td>
                          <td className="px-4 py-3 tabular-nums text-body">{d.total}</td>
                          <td className="px-4 py-3 tabular-nums text-body">
                            {d.evaluated} of {d.total}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={!d.ready}
                                loading={busy === d.dept}
                                onClick={() => evaluate(d.dept)}
                              >
                                Run evaluation
                              </Button>
                              {!d.ready ? (
                                <span className="text-xs text-muted">
                                  Not everyone has submitted
                                </span>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          ) : null}

          {entries.length === 0 ? (
            <Empty
              title="Nothing to evaluate"
              description="Appraisals appear here once departments start entering scores. Check who is outstanding under Submissions."
            />
          ) : (
            <Card>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-line bg-canvas">
                        {[
                          'Staff member',
                          ...(isAcademicOrg ? ['Model'] : []),
                          'Department',
                          'RTP',
                          'Grade',
                          '',
                        ].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs uppercase tracking-wide text-muted">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {entries.map((e) => (
                        <tr key={e.id} className="hover:bg-canvas/60">
                          <td className="px-4 py-3 font-medium text-strong">
                            {e.pesuser_name}
                            {e.flagged ? (
                              <Badge tone="danger" className="ml-2">
                                Flagged
                              </Badge>
                            ) : null}
                          </td>
                          {isAcademicOrg ? (
                            <td className="px-4 py-3 text-body">
                              {e.model === 'academic' ? 'Academic' : 'Non-academic'}
                            </td>
                          ) : null}
                          <td className="px-4 py-3 text-muted">{e.dept ?? '—'}</td>
                          <td className="px-4 py-3 tabular-nums text-body">
                            {e.rtp === null ? (
                              <span className="text-muted">not evaluated</span>
                            ) : (
                              `${Number(e.rtp).toFixed(2)}%`
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {e.grade ? (
                              <Badge tone={GRADE_TONE[e.grade] ?? 'neutral'}>{e.grade}</Badge>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                            {e.partial_target ? (
                              <span className="ml-2 text-xs text-warning-700">provisional</span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/appraisal/entries/${e.id}`}
                              className="text-sm font-medium text-pes hover:underline"
                            >
                              Open
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="text-xl font-semibold tabular-nums text-strong">{value}</p>
    </div>
  );
}
