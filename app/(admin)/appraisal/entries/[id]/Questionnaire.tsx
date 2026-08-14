'use client';

import { useState } from 'react';
import { Alert, Button, Card, CardBody, CardHeader, Textarea } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';
import { AppraisalModel, questionnaireFor } from '@/app/lib/appraisal/instrument';

type Answer = { answer?: boolean | null; note?: string };

/** Items (a) to (h) of the non-academic appraisal. Kept as a record for the
 *  supervisor rather than scored: the client presents it as context, not as part
 *  of the calculation. */
export default function Questionnaire({
  entryId,
  locked,
  initial,
  model,
}: {
  entryId: number;
  locked: boolean;
  model: AppraisalModel;
  initial: Record<string, Answer> | null;
}) {
  // The two sets differ: non-academic runs (a) to (l), academic (a) to (i).
  const items = questionnaireFor(model);
  const [answers, setAnswers] = useState<Record<string, Answer>>(initial ?? {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(key: string, patch: Answer) {
    setAnswers((a) => ({ ...a, [key]: { ...a[key], ...patch } }));
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch('/api/appraisal-v2/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify.success('Questionnaire saved.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const answered = items.filter((i) => {
    const a = answers[i.key];
    return a && (a.note?.trim() || a.answer !== undefined);
  }).length;

  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-semibold text-strong">Supervisor questionnaire</h3>
        <p className="mt-0.5 text-sm text-muted">
          Context for your supervisor. It is recorded alongside the appraisal but does not
          affect the score. {answered} of {items.length} answered.
        </p>
      </CardHeader>
      <CardBody>
        {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}

        <ol className="space-y-5">
          {items.map((item) => {
            const a = answers[item.key] ?? {};
            return (
              <li key={item.key}>
                <p className="mb-2 text-sm text-body">
                  <span className="font-semibold text-strong">({item.key})</span> {item.prompt}
                </p>
                {item.upload ? (
                  <p className="mb-2 text-xs text-muted">
                    Upload certificates with your research evidence until a dedicated
                    upload is added here.
                  </p>
                ) : null}

                {item.type === 'choice' || item.type === 'yes_no_text' ? (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {(item.type === 'choice'
                      ? (item.options ?? []).map((label, i) => ({ label, value: i === 0 }))
                      : [
                          { label: 'Yes', value: true },
                          { label: 'No', value: false },
                        ]
                    ).map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        disabled={locked}
                        onClick={() => update(item.key, { answer: opt.value })}
                        className={`rounded-lg border px-3 py-1 text-sm transition-colors disabled:opacity-50 ${
                          a.answer === opt.value
                            ? 'border-pes bg-pes-50 font-medium text-pes-700'
                            : 'border-line text-body hover:bg-canvas'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : null}

                <Textarea
                  rows={2}
                  disabled={locked}
                  value={a.note ?? ''}
                  onChange={(e) => update(item.key, { note: e.target.value })}
                  placeholder="Your answer"
                  aria-label={`Answer to item ${item.key}`}
                />
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={save} disabled={locked || answered < items.length} loading={busy}>
            Save questionnaire
          </Button>
          {/* AGENTS.md: a disabled control must say why on screen. */}
          {locked ? (
            <p className="text-sm text-muted">
              This appraisal has been submitted, so the questionnaire can no longer be edited.
            </p>
          ) : answered < items.length ? (
            <p className="text-sm text-muted">
              Answer every item to save. {items.length - answered} still to go.
            </p>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
