'use client';

import { useState } from 'react';
import { Alert, Badge, Button, Card, CardBody, CardHeader } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';
import {
  CategoryForm,
  MEASURE_LABEL,
  MIN_STUDENT_EVALUATIONS,
  rulesForForm,
} from '@/app/lib/appraisal/instrument';

type Evidence = { ruleKey: string; measure: string; scripts: string; evidenceUrl: string };

const numberInput =
  'w-24 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm tabular-nums outline-none transition-shadow focus:border-pes-400 focus-visible:shadow-focus';

/** One appraisal form. Handles the three shapes the model uses: line items
 *  scored out of a maximum, a single direct score (Forms 11 and 12), and the
 *  student evaluation, which is the mean of at least ten submitted copies. */
export default function FormCard({
  form,
  entryId,
  locked,
  savedQuality,
  onSaved,
}: {
  form: CategoryForm;
  entryId: number;
  locked: boolean;
  savedQuality: number | null;
  onSaved: () => void;
}) {
  const rules = rulesForForm(form.key);
  const isStudentForm = form.key === 'student_evaluation';

  const [lineItems, setLineItems] = useState<string[]>(() => form.items.map(() => ''));
  const [directScore, setDirectScore] = useState('');
  const [copies, setCopies] = useState<string[][]>([]);
  const [studentCount, setStudentCount] = useState('');
  const [basicUnits, setBasicUnits] = useState('');
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxTotal = form.items.reduce((s, i) => s + i.max, 0);
  const runningTotal = lineItems.reduce((s, v) => s + (Number(v) || 0), 0);

  const required = Number(studentCount) > MIN_STUDENT_EVALUATIONS
    ? MIN_STUDENT_EVALUATIONS
    : Number(studentCount) || 0;
  const copiesShort = isStudentForm && copies.length < required;

  const ready = locked
    ? false
    : isStudentForm
      ? !copiesShort && copies.length > 0 && studentCount !== ''
      : form.directScore
        ? directScore !== ''
        : lineItems.some((v) => v !== '');

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch('/api/appraisal-v2/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId,
          category: form.key,
          lineItems: form.directScore ? [Number(directScore)] : lineItems.map((v) => Number(v) || 0),
          ...(isStudentForm
            ? {
                copies: copies.map((c) => c.map((v) => Number(v) || 0)),
                studentCount: Number(studentCount),
                basicUnits: Number(basicUnits) || 0,
              }
            : {}),
          evidence: evidence
            .filter((e) => e.ruleKey && e.measure !== '')
            .map((e) => ({
              ruleKey: e.ruleKey,
              measure: Number(e.measure),
              scripts: e.scripts === '' ? undefined : Number(e.scripts),
              evidenceUrl: e.evidenceUrl || undefined,
            })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save this form.');
      notify.success(`${form.label} saved.`);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-strong">
              Form {form.form}. {form.label}
            </h3>
            <p className="mt-0.5 text-sm text-muted">
              Entered by {form.enteredBy === 'department_admin' ? 'the departmental admin' : 'the appraisee'}
              {maxTotal > 0 ? `, scored out of ${maxTotal}` : ''}
            </p>
          </div>
          {savedQuality !== null ? (
            <Badge tone="success">Saved at {Number(savedQuality).toFixed(1)}%</Badge>
          ) : (
            <Badge tone="neutral">Not entered</Badge>
          )}
        </div>
      </CardHeader>

      <CardBody>
        {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}

        {isStudentForm ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-body">Students on the course</span>
                <input
                  type="number"
                  min={0}
                  value={studentCount}
                  onChange={(e) => setStudentCount(e.target.value)}
                  disabled={locked}
                  className={numberInput}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-body">Basic units for the course</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={basicUnits}
                  onChange={(e) => setBasicUnits(e.target.value)}
                  disabled={locked}
                  className={numberInput}
                />
              </label>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-body">
                  Completed copies: {copies.length}
                  {required > 0 ? ` of ${required} needed` : ''}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={locked}
                  onClick={() => setCopies((c) => [...c, form.items.map(() => '')])}
                >
                  Add a copy
                </Button>
              </div>

              {copies.length === 0 ? (
                <p className="text-sm text-muted">
                  Add one copy per completed student evaluation form. The recorded result is
                  their mean.
                </p>
              ) : (
                <div className="space-y-3">
                  {copies.map((copy, ci) => (
                    <div key={ci} className="rounded-lg border border-line p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Copy {ci + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCopies((c) => c.filter((_, i) => i !== ci))}
                          disabled={locked}
                          className="text-xs font-medium text-danger-700 hover:underline disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {form.items.map((item, ii) => (
                          <label key={ii} className="text-xs">
                            <span className="mb-0.5 block text-muted">
                              {item.label} <span className="tabular-nums">/{item.max}</span>
                            </span>
                            <input
                              type="number"
                              min={0}
                              max={item.max}
                              value={copy[ii]}
                              disabled={locked}
                              onChange={(e) =>
                                setCopies((all) =>
                                  all.map((c, i) =>
                                    i === ci ? c.map((v, j) => (j === ii ? e.target.value : v)) : c,
                                  ),
                                )
                              }
                              className="w-full rounded-lg border border-line bg-surface px-2 py-1 text-sm tabular-nums outline-none focus:border-pes-400 focus-visible:shadow-focus"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : form.directScore ? (
          <label className="text-sm">
            <span className="mb-1 block font-medium text-body">Quality score for this indicator</span>
            <input
              type="number"
              min={0}
              max={100}
              value={directScore}
              disabled={locked}
              onChange={(e) => setDirectScore(e.target.value)}
              className={numberInput}
            />
            <span className="ml-2 text-muted">out of 100</span>
          </label>
        ) : (
          <div className="space-y-2">
            {form.items.map((item, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-2 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-body">{item.label}</p>
                  {item.assessor ? (
                    <p className="text-xs text-muted">{item.assessor}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={item.max}
                    value={lineItems[i]}
                    disabled={locked}
                    onChange={(e) =>
                      setLineItems((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
                    }
                    aria-label={item.label}
                    className={numberInput}
                  />
                  <span className="w-10 text-sm tabular-nums text-muted">/{item.max}</span>
                </div>
              </div>
            ))}
            <p className="pt-1 text-sm text-body">
              Running total <span className="font-semibold tabular-nums text-strong">{runningTotal}</span>{' '}
              of {maxTotal}
            </p>
          </div>
        )}

        {rules.length > 0 ? (
          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium text-body">Evidence of output</p>
              <Button
                size="sm"
                variant="secondary"
                disabled={locked}
                onClick={() =>
                  setEvidence((e) => [...e, { ruleKey: rules[0].key, measure: '', scripts: '', evidenceUrl: '' }])
                }
              >
                Add evidence
              </Button>
            </div>
            {evidence.length === 0 ? (
              <p className="text-sm text-muted">
                How much work was done. Quality alone does not produce a score without it.
                {form.key === 'research' || form.key === 'fault_solving'
                  ? ' Research entries must link to supporting evidence.'
                  : ''}
              </p>
            ) : (
              <div className="space-y-2">
                {evidence.map((row, i) => {
                  const rule = rules.find((r) => r.key === row.ruleKey) ?? rules[0];
                  return (
                    <div key={i} className="flex flex-wrap items-end gap-2">
                      <select
                        value={row.ruleKey}
                        disabled={locked}
                        onChange={(e) =>
                          setEvidence((all) =>
                            all.map((r, j) => (j === i ? { ...r, ruleKey: e.target.value } : r)),
                          )
                        }
                        aria-label="Type of output"
                        className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-pes-400 focus-visible:shadow-focus"
                      >
                        {rules.map((r) => (
                          <option key={r.key} value={r.key}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <label className="text-xs">
                        <span className="mb-0.5 block text-muted">{MEASURE_LABEL[rule.per]}</span>
                        <input
                          type="number"
                          min={0}
                          value={row.measure}
                          disabled={locked}
                          onChange={(e) =>
                            setEvidence((all) =>
                              all.map((r, j) => (j === i ? { ...r, measure: e.target.value } : r)),
                            )
                          }
                          className={numberInput}
                        />
                      </label>
                      {rule.perScript ? (
                        <label className="text-xs">
                          <span className="mb-0.5 block text-muted">Assessed scripts</span>
                          <input
                            type="number"
                            min={0}
                            value={row.scripts}
                            disabled={locked}
                            onChange={(e) =>
                              setEvidence((all) =>
                                all.map((r, j) => (j === i ? { ...r, scripts: e.target.value } : r)),
                              )
                            }
                            className={numberInput}
                          />
                        </label>
                      ) : null}
                      <label className="min-w-0 flex-1 text-xs">
                        <span className="mb-0.5 block text-muted">Link to the evidence</span>
                        <input
                          type="url"
                          value={row.evidenceUrl}
                          disabled={locked}
                          placeholder="https://"
                          onChange={(e) =>
                            setEvidence((all) =>
                              all.map((r, j) => (j === i ? { ...r, evidenceUrl: e.target.value } : r)),
                            )
                          }
                          className="w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-pes-400 focus-visible:shadow-focus"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => setEvidence((all) => all.filter((_, j) => j !== i))}
                        className="pb-1.5 text-xs font-medium text-danger-700 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={save} disabled={!ready} loading={busy}>
            Save form
          </Button>
          {/* AGENTS.md: a disabled control must say why on screen. */}
          {locked ? (
            <p className="text-sm text-muted">
              This appraisal has been submitted, so its forms can no longer be edited.
            </p>
          ) : !ready ? (
            <p className="text-sm text-muted">
              {isStudentForm
                ? copies.length === 0
                  ? 'Add at least one completed copy.'
                  : studentCount === ''
                    ? 'Enter how many students are on the course.'
                    : `${required} completed copies are needed, ${copies.length} added so far.`
                : 'Enter at least one score to save.'}
            </p>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
