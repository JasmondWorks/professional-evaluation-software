'use client';

import { useRef, useState } from 'react';
import { TickCircle } from 'iconsax-react';
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

/** Attach a file as proof for one piece of evidence. The model requires research
 *  to be submitted "with evidence duly uploaded", so this is an upload rather
 *  than a link field, though an already-hosted URL still works. */
function EvidenceUpload({
  url,
  locked,
  onChange,
}: {
  url: string;
  locked: boolean;
  onChange: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function send(file: File) {
    setBusy(true);
    setProblem(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await apiFetch('/api/appraisal-v2/evidence', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'The file could not be uploaded.');
      onChange(data.url);
    } catch (err: any) {
      setProblem(err.message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={ref}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        className="sr-only"
        aria-label="Upload evidence"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) send(f);
        }}
      />
      <Button
        size="sm"
        variant="secondary"
        disabled={locked}
        loading={busy}
        onClick={() => ref.current?.click()}
      >
        {url ? 'Replace file' : 'Upload file'}
      </Button>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="truncate text-xs font-medium text-pes underline underline-offset-2"
        >
          View attached
        </a>
      ) : (
        <span className="text-xs text-muted">PDF, Word or image, up to 10MB</span>
      )}
      {problem ? <span className="w-full text-xs text-danger-700">{problem}</span> : null}
    </div>
  );
}

const numberInput =
  'w-24 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm tabular-nums outline-none transition-shadow focus:border-pes-400 focus-visible:shadow-focus';

/** One appraisal form. Handles the three shapes the model uses: line items
 *  scored out of a maximum, a single direct score (Forms 11 and 12), and the
 *  student evaluation, which is the mean of at least ten submitted copies. */
export default function FormCard({
  form,
  entryId,
  locked,
  lockedReason,
  savedQuality,
  savedLineItems,
  savedCopies,
  savedStudentCount,
  savedBasicUnits,
  onSaved,
}: {
  form: CategoryForm;
  entryId: number;
  locked: boolean;
  /** Why this form is read-only for this viewer, when it is not simply submitted. */
  lockedReason?: string;
  savedQuality: number | null;
  /** What was actually saved, so a submitted form shows its scores instead of
   *  rendering empty and looking as though the data was lost. */
  savedLineItems?: unknown;
  savedCopies?: number | null;
  savedStudentCount?: number | null;
  savedBasicUnits?: string | number | null;
  onSaved?: () => void;
}) {
  const rules = rulesForForm(form.key);
  const isStudentForm = form.key === 'student_evaluation';

  // Student evaluation stores an array of copies; every other form stores one
  // array of line-item scores.
  const savedRows = Array.isArray(savedLineItems) ? (savedLineItems as any[]) : null;
  const savedFlat =
    savedRows && savedRows.length > 0 && !Array.isArray(savedRows[0]) ? (savedRows as any[]) : null;
  const savedCopyRows =
    savedRows && savedRows.length > 0 && Array.isArray(savedRows[0]) ? (savedRows as any[][]) : null;

  const [lineItems, setLineItems] = useState<string[]>(() =>
    form.items.map((_, i) => (savedFlat?.[i] !== undefined ? String(savedFlat[i]) : '')),
  );
  const [directScore, setDirectScore] = useState(() =>
    form.directScore && savedFlat?.[0] !== undefined ? String(savedFlat[0]) : '',
  );
  const [copies, setCopies] = useState<string[][]>(() =>
    savedCopyRows ? savedCopyRows.map((r) => r.map((v) => String(v))) : [],
  );
  const [studentCount, setStudentCount] = useState(() => (savedStudentCount != null ? String(savedStudentCount) : ''));
  const [basicUnits, setBasicUnits] = useState(() => (savedBasicUnits != null ? String(Number(savedBasicUnits)) : ''));
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Nothing has been touched since the last save. Drives the button settling to
  // "Form saved" and waking up again on the next edit.
  const [clean, setClean] = useState(savedQuality !== null);
  const [showErrors, setShowErrors] = useState(false);
  const touch = () => { setClean(false); setShowErrors(false); };

  const maxTotal = form.items.reduce((s, i) => s + i.max, 0);
  const runningTotal = lineItems.reduce((s, v) => s + (Number(v) || 0), 0);

  const required = Number(studentCount) > MIN_STUDENT_EVALUATIONS
    ? MIN_STUDENT_EVALUATIONS
    : Number(studentCount) || 0;
  const copiesShort = isStudentForm && copies.length < required;

  // Every field, not just one. The client found the button going active after a
  // single entry, which invites submitting a half-filled form.
  const allLineItemsIn = lineItems.every((v) => v !== '');
  const allCopiesComplete =
    copies.length > 0 && copies.every((c) => c.every((v) => v !== ''));

  const ready = locked
    ? false
    : isStudentForm
      ? !copiesShort && allCopiesComplete && studentCount !== '' && basicUnits !== ''
      : form.directScore
        ? directScore !== ''
        : allLineItemsIn;

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
      setClean(true);
      onSaved?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const saved = savedQuality !== null;
  // Settled means saved with nothing touched since, so the button reads back the
  // state rather than inviting a pointless second save.
  const settled = saved && clean && !locked;

  const missingHint = isStudentForm
    ? copies.length === 0
      ? 'Add at least one completed copy.'
      : studentCount === ''
        ? 'Enter how many students are on the course.'
        : basicUnits === ''
          ? 'Choose the basic units for the course.'
          : copiesShort
            ? `${required} completed copies are needed, ${copies.length} added so far.`
            : 'Every score on every copy must be filled in.'
    : `Fill in every score to save. ${lineItems.filter((v) => v === '').length} still empty.`;

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
          {savedQuality === null ? <Badge tone="danger">Not filled in</Badge> : null}
        </div>
      </CardHeader>

      <CardBody>
        {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}

        {isStudentForm ? (
          <div className="space-y-4">
            {/* Course details share the form's surface rather than floating above
                it, so the whole card reads as one thing to fill in. */}
            <div className="flex flex-wrap gap-4 rounded-lg border border-line bg-canvas p-4">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-body">Students on the course</span>
                <input
                  type="number"
                  min={0}
                  value={studentCount}
                  onChange={(e) => { touch(); setStudentCount(e.target.value); }}
                  disabled={locked}
                  className={numberInput}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-body">Basic units for the course</span>
                {/* Course units are whole numbers, so this is a choice rather
                    than a free decimal field. */}
                <select
                  value={basicUnits}
                  onChange={(e) => setBasicUnits(e.target.value)}
                  disabled={locked}
                  className={numberInput}
                >
                  <option value="">Choose</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-body">
                  Completed copies: {copies.length}
                  {required > 0 ? ` of ${required} needed` : ''}
                </p>
                {!locked ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => (touch(), setCopies((c) => [...c, form.items.map(() => '')]))}
                  >
                    Add a copy
                  </Button>
                ) : null}
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
                        {!locked ? (
                          <button
                            type="button"
                            onClick={() => { touch(); setCopies((c) => c.filter((_, i) => i !== ci)); }}
                            className="text-xs font-medium text-danger-700 hover:underline"
                          >
                            Remove
                          </button>
                        ) : null}
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
                              onChange={(e) => {
                                touch();
                                setCopies((all) =>
                                  all.map((c, i) =>
                                    i === ci ? c.map((v, j) => (j === ii ? e.target.value : v)) : c,
                                  ),
                                );
                              }}
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
              onChange={(e) => { touch(); setDirectScore(e.target.value); }}
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
                    onChange={(e) => {
                      touch();
                      setLineItems((prev) => prev.map((v, j) => (j === i ? e.target.value : v)));
                    }}
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
          <div className="mt-5 rounded-lg border border-line bg-canvas p-4">
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
                      <div className="min-w-0 flex-1 text-xs">
                        <span className="mb-0.5 block text-muted">Evidence</span>
                        <EvidenceUpload
                          url={row.evidenceUrl}
                          locked={locked}
                          onChange={(url) =>
                            setEvidence((all) =>
                              all.map((r, j) => (j === i ? { ...r, evidenceUrl: url } : r)),
                            )
                          }
                        />
                      </div>
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

        {/* State and action sit together at the bottom right, where the eye
            finishes the form, rather than in the header where a save confirmation
            is easily missed. */}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-x-3 gap-y-2 border-t border-line pt-4">
          {locked ? (
            <p className="mr-auto text-sm text-muted">
              {lockedReason ?? 'This appraisal has been submitted, so its forms can no longer be edited.'}
            </p>
          ) : showErrors && !ready ? (
            <p className="mr-auto text-sm text-danger-700">{missingHint}</p>
          ) : !ready ? (
            <p className="mr-auto text-sm text-muted">{missingHint}</p>
          ) : null}

          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
              <TickCircle size={18} variant="Bold" />
              Saved at {Number(savedQuality).toFixed(1)}%
            </span>
          ) : null}

          {/* AGENTS.md: looks unavailable, still takes the click so pressing it
              says which field is missing. */}
          {!locked ? (
            <Button
              onClick={() => (ready ? save() : setShowErrors(true))}
              aria-disabled={!ready || settled}
              loading={busy}
              className={!ready || settled ? 'opacity-50' : undefined}
            >
              {settled ? 'Form saved' : 'Save form'}
            </Button>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
