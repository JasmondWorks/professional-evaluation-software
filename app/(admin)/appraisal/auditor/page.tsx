'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardBody, CardHeader, Empty, PageHeader, Textarea } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';

type Referred = {
  id: number;
  pesuser_name: string;
  dept: string | null;
  model: string;
  categories: {
    category: string;
    appraisal_score: string | null;
    hod_score: string | null;
    hod_justification: string | null;
    auditor_score: string | null;
    auditor_note: string | null;
  }[];
};

/** The appraisal auditor's queue. The client confirmed the auditor sees both
 *  scores and the reason for referral, and never the tolerance band. */
export default function AuditorPage() {
  const [queue, setQueue] = useState<Referred[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await apiFetch('/api/appraisal-v2/auditor');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not load the queue.');
      setQueue(data.referred);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Appraisal auditor"
        subtitle="Scores the appraisee contested. Your figure is the one that gets recorded."
      />

      {error ? <Alert tone="danger" className="mb-6">{error}</Alert> : null}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-pes border-t-transparent" />
        </div>
      ) : queue.length === 0 ? (
        <Empty
          title="Nothing is waiting on you"
          description="A case appears here when a member of staff contests the score their head of department recorded."
        />
      ) : (
        <div className="space-y-5">
          {queue.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <h2 className="text-base font-semibold text-strong">{entry.pesuser_name}</h2>
                <p className="mt-0.5 text-sm text-muted">
                  {entry.model === 'academic' ? 'Academic' : 'Non-academic'}
                  {entry.dept ? ` · ${entry.dept}` : ''}
                </p>
              </CardHeader>
              <CardBody className="space-y-5">
                {entry.categories.map((c) => (
                  <AuditCase key={c.category} entryId={entry.id} c={c} onDone={load} />
                ))}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AuditCase({
  entryId,
  c,
  onDone,
}: {
  entryId: number;
  c: Referred['categories'][number];
  onDone: () => void;
}) {
  const [score, setScore] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch('/api/appraisal-v2/auditor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, category: c.category, score: Number(score), note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify.success('Final score recorded.');
      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const label = c.category.replace(/_/g, ' ');

  return (
    <div className="border-t border-line pt-4 first:border-0 first:pt-0">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{label}</h3>

      {error ? <Alert tone="danger" className="mb-3">{error}</Alert> : null}

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-canvas px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-muted">Appraisee scored</p>
          <p className="text-lg font-semibold tabular-nums text-strong">
            {c.appraisal_score ? Number(c.appraisal_score).toFixed(1) : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-canvas px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-muted">Head of department scored</p>
          <p className="text-lg font-semibold tabular-nums text-strong">
            {c.hod_score ? Number(c.hod_score).toFixed(1) : '—'}
          </p>
        </div>
      </div>

      {c.hod_justification ? (
        <div className="mb-3">
          <p className="mb-1 text-xs uppercase tracking-wide text-muted">
            Reason the head of department gave
          </p>
          <p className="rounded-lg bg-canvas px-3 py-2 text-sm text-body">{c.hod_justification}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-body">Your final score</span>
          <input
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-24 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm tabular-nums outline-none focus:border-pes-400 focus-visible:shadow-focus"
          />
        </label>
      </div>
      <Textarea
        className="mt-3"
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note on how you reached this figure"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          onClick={() => (score === "" ? setError("Enter your final score first.") : submit())}
          aria-disabled={score === ''}
          className={score === '' ? "opacity-50" : undefined}
          loading={busy}
        >
          Record final score
        </Button>
        {score === '' ? (
          <p className="text-sm text-muted">Enter a score to resolve this case.</p>
        ) : null}
      </div>
    </div>
  );
}
