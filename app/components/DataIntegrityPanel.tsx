'use client';

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, Badge, Button, Card, CardBody, CardHeader } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import type { IntegrityReport } from '@/app/lib/integrity';

// The data integrity test as it appears inside a model. One panel serves both the
// appraisal and the performance model — only the endpoint differs — so the two
// cannot drift apart in wording or in what they count as a pass.
//
// The admin can run it by hand from the button here, and the model runs it for
// them straight after an evaluation via the imperative handle. It reports rather
// than blocks: an outlier is a submission worth looking at, not proof of an error,
// so releasing results stays the admin's decision.

export type DataIntegrityHandle = { run: () => Promise<void> };

type Props = {
  model: 'appraisal' | 'performance';
  periodId: number | null;
  /** Skip the automatic first run — used where nothing has been evaluated yet. */
  autoRun?: boolean;
};

const ENDPOINT: Record<Props['model'], string> = {
  appraisal: '/api/appraisal-v2/integrity',
  performance: '/api/performance-v2/integrity',
};

function DataIntegrityPanel({ model, periodId, autoRun = false }: Props, ref: React.Ref<DataIntegrityHandle>) {
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!periodId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`${ENDPOINT[model]}?periodId=${periodId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'The data integrity test could not be run.');
      setReport(data.report);
    } catch (err: any) {
      setError(err.message ?? 'The data integrity test could not be run.');
    } finally {
      setLoading(false);
    }
  }, [model, periodId]);

  useImperativeHandle(ref, () => ({ run }), [run]);

  useEffect(() => {
    if (autoRun) run();
  }, [autoRun, run]);

  const totals = report?.totals;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-strong">Data integrity</h2>
            <p className="mt-0.5 text-sm text-muted">
              Checks every {model} submission in this period, across all departments, for
              figures that sit outside their department&apos;s normal range. It runs on its own
              after an evaluation.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={run}
            loading={loading}
            disabled={loading || !periodId}
          >
            Run data integrity
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {!periodId ? (
          <p className="text-sm text-muted">Open a period before running the test.</p>
        ) : error ? (
          <Alert tone="danger">{error}</Alert>
        ) : !report ? (
          <p className="text-sm text-muted">
            {loading ? 'Running the test…' : 'Not run yet for this period.'}
          </p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {report.passed ? (
                <span className="inline-flex items-center gap-2 rounded-lg border border-success-100 bg-success-50 px-3 py-2 text-sm font-medium text-success-700">
                  <CheckCircle2 size={16} />
                  Passed — no outliers in {totals!.tested} tested department
                  {totals!.tested === 1 ? '' : 's'}.
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700">
                  <XCircle size={16} />
                  {totals!.outliers} submission{totals!.outliers === 1 ? '' : 's'} outside the
                  range, in {totals!.withOutliers} department
                  {totals!.withOutliers === 1 ? '' : 's'}.
                </span>
              )}
              <span className="text-xs text-muted">
                {totals!.submissions} submission{totals!.submissions === 1 ? '' : 's'} · run{' '}
                {new Date(report.ranAt).toLocaleTimeString()}
              </span>
            </div>

            {totals!.notEnough > 0 ? (
              <Alert tone="warning" icon={<AlertTriangle size={16} />} className="mb-4">
                {totals!.notEnough} department{totals!.notEnough === 1 ? ' has' : 's have'} fewer
                than {report.minSubmissions} submissions, which is too few to test. They are
                listed as untested rather than passed.
              </Alert>
            ) : null}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas">
                    {['Department', 'Submissions', 'Result', 'Outside the range'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-xs uppercase tracking-wide text-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {report.departments.map((d) => (
                    <tr key={d.dept}>
                      <td className="px-4 py-3 font-medium text-strong">{d.dept}</td>
                      <td className="px-4 py-3 tabular-nums text-body">{d.submissions}</td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            d.status === 'passed'
                              ? 'success'
                              : d.status === 'outliers'
                                ? 'danger'
                                : 'warning'
                          }
                        >
                          {d.status === 'passed'
                            ? 'Passed'
                            : d.status === 'outliers'
                              ? `${d.outliers.length} outlier${d.outliers.length === 1 ? '' : 's'}`
                              : 'Too few to test'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {d.outliers.length === 0 ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <ul className="flex flex-wrap gap-1.5">
                            {d.outliers.map((o) => (
                              <li
                                key={o.name}
                                className="rounded-full bg-danger-100 px-2.5 py-0.5 text-xs font-medium text-danger-700"
                                title={`Total ${o.score.toFixed(2)} — the department's range is ${d.lower?.toFixed(2)} to ${d.upper?.toFixed(2)}`}
                              >
                                {o.name} ({o.score.toFixed(1)})
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

export default forwardRef(DataIntegrityPanel);
