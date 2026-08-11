'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Alert, Badge, Button, Card, CardBody, CardHeader, PageHeader, Textarea,
} from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';
import { AppraisalModel, formsFor } from '@/app/lib/appraisal/instrument';
import FormCard from './FormCard';
import Questionnaire from './Questionnaire';

type CategoryScore = {
  category: string;
  quality: string | null;
  hod_score: string | null;
  hod_justification: string | null;
  staff_accepted: boolean | null;
  reconciliation: string | null;
  recorded_score: string | null;
  auditor_score: string | null;
};

type Entry = {
  id: number;
  pesuser_name: string;
  dept: string | null;
  model: AppraisalModel;
  position: string | null;
  cadre: string | null;
  status: string;
  rtp: string | null;
  grade: string | null;
  partial_target: boolean;
  questionnaire: Record<string, { answer?: boolean | null; note?: string }> | null;
  categories: CategoryScore[];
};

export default function EntryPage() {
  const params = useParams<{ id: string }>();
  const entryId = Number(params.id);

  const [entry, setEntry] = useState<Entry | null>(null);
  const [sealed, setSealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/appraisal-v2/entry?entryId=${entryId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not load this appraisal.');
      setEntry(data.entry);
      setSealed(data.sealed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [entryId]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    setBusy(true);
    try {
      const res = await apiFetch('/api/appraisal-v2/score', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify.success('Submitted for review. The forms are now locked.');
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-pes border-t-transparent" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <Alert tone="danger">{error ?? 'This appraisal could not be found.'}</Alert>
      </div>
    );
  }

  const forms = formsFor(entry.model);
  const locked = entry.status !== 'draft';
  const scoreFor = (key: string) => entry.categories.find((c) => c.category === key) ?? null;
  const entered = entry.categories.length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <Link href="/appraisal/entries" className="mb-3 inline-block text-sm text-muted hover:text-pes">
        Back to appraisals
      </Link>

      <PageHeader
        title={entry.pesuser_name}
        subtitle={`${entry.model === 'academic' ? 'Academic' : 'Non-academic'} appraisal${
          entry.dept ? ` · ${entry.dept}` : ''
        } · ${entered} of ${forms.length} forms entered`}
        actions={
          !locked ? (
            <Button onClick={submit} disabled={entered === 0} loading={busy}>
              Submit for review
            </Button>
          ) : null
        }
      />

      {error ? <Alert tone="danger" className="mb-6">{error}</Alert> : null}

      {!locked && entered === 0 ? (
        <p className="mb-6 text-sm text-muted">
          Enter at least one form before submitting.
        </p>
      ) : null}

      {sealed ? (
        <Alert tone="brand" className="mb-6">
          Your result stays hidden until the appraisal period closes and the organization
          admin releases it.
        </Alert>
      ) : entry.rtp !== null ? (
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">RTP</p>
                <p className="text-2xl font-semibold tabular-nums text-strong">
                  {Number(entry.rtp).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Grade</p>
                <p className="text-2xl font-semibold text-pes">{entry.grade}</p>
              </div>
              {entry.partial_target ? (
                <Alert tone="warning" className="flex-1">
                  One or more categories have no target set, so this covers only part of the
                  appraisal.
                </Alert>
              ) : null}
            </div>
          </CardBody>
        </Card>
      ) : null}

      <div className="space-y-5">
        {forms.map((form) => {
          const score = scoreFor(form.key);
          return (
            <div key={form.key} className="space-y-3">
              <FormCard
                form={form}
                entryId={entryId}
                locked={locked}
                savedQuality={score?.quality ? Number(score.quality) : null}
                onSaved={load}
              />
              {score ? (
                <ReviewPanel entryId={entryId} formKey={form.key} score={score} onChange={load} />
              ) : null}
            </div>
          );
        })}

        {entry.model === 'non_academic' ? (
          <Questionnaire entryId={entryId} locked={locked} initial={entry.questionnaire} />
        ) : null}
      </div>
    </div>
  );
}

/** The HOD's decision and the appraisee's reply. The client's rule: if the HOD
 *  enters no contrary score the appraisee's own score stands. Only a contrary
 *  score goes back to the appraisee, who may accept or contest it. */
function ReviewPanel({
  entryId,
  formKey,
  score,
  onChange,
}: {
  entryId: number;
  formKey: string;
  score: CategoryScore;
  onChange: () => void;
}) {
  const [hodScore, setHodScore] = useState('');
  const [justification, setJustification] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const awaitingStaff = score.reconciliation === 'awaiting_staff_response';
  const settled = score.recorded_score !== null;
  const referred = score.reconciliation === 'referred_to_auditor';

  async function post(path: string, body: Record<string, unknown>, message: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/appraisal-v2/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, category: formKey, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify.success(message);
      onChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted">Review</h4>
          {referred ? (
            <Badge tone="danger">With the auditor</Badge>
          ) : settled ? (
            <Badge tone="success">Recorded at {Number(score.recorded_score).toFixed(1)}</Badge>
          ) : awaitingStaff ? (
            <Badge tone="warning">Awaiting the appraisee</Badge>
          ) : (
            <Badge tone="neutral">Not yet reviewed</Badge>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {error ? <Alert tone="danger" className="mb-3">{error}</Alert> : null}

        {score.hod_score !== null ? (
          <div className="mb-4 space-y-2 text-sm">
            <p className="text-body">
              The head of department recorded{' '}
              <span className="font-semibold tabular-nums text-strong">
                {Number(score.hod_score).toFixed(1)}
              </span>{' '}
              against the appraisee&apos;s{' '}
              <span className="font-semibold tabular-nums text-strong">
                {score.quality ? Number(score.quality).toFixed(1) : '—'}
              </span>
              .
            </p>
            {score.hod_justification ? (
              <p className="rounded-lg bg-canvas px-3 py-2 text-body">
                {score.hod_justification}
              </p>
            ) : null}
          </div>
        ) : null}

        {awaitingStaff ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              loading={busy}
              onClick={() => post('respond', { accepted: true }, 'Adjustment accepted.')}
            >
              Accept the adjustment
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={busy}
              onClick={() =>
                post('respond', { accepted: false }, 'Contested. Passed to the appraisal auditor.')
              }
            >
              Contest it
            </Button>
          </div>
        ) : settled || referred ? (
          <p className="text-sm text-muted">
            {referred
              ? 'The appraisal auditor will review both scores and record a final figure.'
              : 'No further action is needed on this form.'}
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Leave this blank to accept the appraisee&apos;s score as final. Enter a different
              score only if you disagree, and say why.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-body">Your score</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={hodScore}
                  onChange={(e) => setHodScore(e.target.value)}
                  className="w-24 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm tabular-nums outline-none focus:border-pes-400 focus-visible:shadow-focus"
                />
              </label>
            </div>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Why this score differs from the appraisee's"
              rows={3}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                loading={busy}
                disabled={hodScore === '' || justification.trim() === ''}
                onClick={() =>
                  post(
                    'review',
                    { hodScore: Number(hodScore), justification },
                    'Score recorded and sent to the appraisee.',
                  )
                }
              >
                Record my score
              </Button>
              {hodScore === '' || justification.trim() === '' ? (
                <p className="text-sm text-muted">
                  {hodScore === ''
                    ? 'Enter a score, or leave the whole panel blank to accept theirs.'
                    : 'A written justification is required before a score can be changed.'}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
