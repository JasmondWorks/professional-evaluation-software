'use client';

import { useCallback, useEffect, useState } from 'react';
import { notify } from '@/lib/toast';
import { apiFetch } from '@/app/utils/apiFetch';
import Button from '@/app/components/ui/Button';
import PageHeader from '@/app/components/ui/PageHeader';
import Badge from '@/app/components/ui/Badge';
import RatingTable from '@/app/components/performance/RatingTable';
import {
  CRITERIA,
  CriterionKey,
  criterionMaximum,
} from '@/app/lib/performance/instrument';

// The four criteria the client named: competence, integrity, compatibility and
// use of resources. Each is normalised to 100 on the server; the running figure
// shown here is the same arithmetic, for feedback only.
//
// NOTE: this screen used to compute the four totals in the browser and post them
// as finished scores, which meant anyone could post any figure. It now posts
// ratings and lets the server score them.

type CriterionRow = {
  criterion: CriterionKey;
  staff_score: string | number | null;
  hod_score: string | number | null;
  hod_justification: string | null;
  staff_accepted: boolean | null;
  reconciliation: string | null;
  recorded_score: string | number | null;
  auditor_score: string | number | null;
  auditor_note: string | null;
  ratings: number[] | null;
};

type Entry = {
  id: number;
  status: string;
  overall: string | number | null;
  rtp: string | number | null;
  grade: string | null;
  class_rank: string | null;
  descriptive: string | null;
  criteria: CriterionRow[];
  released: boolean;
};

export default function PerformanceDataEntry() {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [step, setStep] = useState(0);
  const [ratings, setRatings] = useState<Record<CriterionKey, Record<number, number>>>(
    {} as Record<CriterionKey, Record<number, number>>,
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const current = CRITERIA[step];

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/performance-v2/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not open your performance record.');
        return;
      }

      const detail = await apiFetch(`/api/performance-v2/entry?entryId=${data.entry.id}`);
      const full = await detail.json();
      if (!detail.ok) {
        setError(full.error ?? 'Could not load your performance record.');
        return;
      }

      setEntry(full.entry);
      // Show back what was already saved, so a half-finished form resumes.
      const restored = {} as Record<CriterionKey, Record<number, number>>;
      for (const row of full.entry.criteria ?? []) {
        if (!Array.isArray(row.ratings)) continue;
        restored[row.criterion as CriterionKey] = Object.fromEntries(
          row.ratings.map((r: number, i: number) => [i, r]),
        );
      }
      setRatings(restored);
      setError('');
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setRating = (index: number, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [current.key]: { ...(prev[current.key] ?? {}), [index]: value },
    }));
  };

  const ratingsFor = (key: CriterionKey) => ratings[key] ?? {};

  const isComplete = (key: CriterionKey) => {
    const def = CRITERIA.find((c) => c.key === key)!;
    const given = ratingsFor(key);
    return def.parameters.every((_p, i) => typeof given[i] === 'number');
  };

  /** The running normalised figure, for feedback. The server recomputes it. */
  const runningResult = (key: CriterionKey) => {
    const def = CRITERIA.find((c) => c.key === key)!;
    const given = ratingsFor(key);
    const points = def.parameters.reduce(
      (sum, p, i) => sum + ((given[i] ?? 0) / 10) * p.max,
      0,
    );
    return (points / criterionMaximum(key)) * 100;
  };

  const saveCurrent = async () => {
    if (!entry) return false;
    if (!isComplete(current.key)) {
      notify.error(`Rate every parameter in "${current.label}" before continuing.`);
      return false;
    }
    const given = ratingsFor(current.key);
    const ordered = current.parameters.map((_p, i) => given[i]);

    setBusy(true);
    try {
      const res = await apiFetch('/api/performance-v2/criterion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: entry.id, criterion: current.key, ratings: ordered }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error ?? 'Could not save that criterion.');
        return false;
      }
      return true;
    } catch {
      notify.error('Could not reach the server.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    if (await saveCurrent()) setStep((s) => Math.min(s + 1, CRITERIA.length - 1));
  };

  const submit = async () => {
    if (!entry) return;
    if (!(await saveCurrent())) return;

    setBusy(true);
    try {
      const res = await apiFetch('/api/performance-v2/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: entry.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error ?? 'Could not submit.');
        return;
      }
      notify.success('Performance submitted. Your head of department will review it.');
      await load();
    } catch {
      notify.error('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  const respond = async (criterion: CriterionKey, accepted: boolean) => {
    if (!entry) return;
    setBusy(true);
    try {
      const res = await apiFetch('/api/performance-v2/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: entry.id, criterion, accepted }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error ?? 'Could not record your response.');
        return;
      }
      notify.success(
        data.outcome === 'referred'
          ? 'Recorded. This score now goes to the external auditor, whose decision is final.'
          : 'Recorded. Thank you.',
      );
      await load();
    } catch {
      notify.error('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pes border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <PageHeader title="Performance data entry" />
        <div className="p-4 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 text-sm" role="alert">
          {error || 'No performance record is available.'}
        </div>
      </div>
    );
  }

  const pending = (entry.criteria ?? []).filter(
    (c) => c.hod_score !== null && c.staff_accepted === null,
  );
  const sealed = entry.status !== 'draft';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Performance data entry"
        subtitle={
          sealed
            ? 'Submitted. You can no longer edit these ratings.'
            : `Step ${step + 1} of ${CRITERIA.length} — ${current.label}`
        }
      />

      {/* Anything the head has objected to comes first: it is the only thing on
          this screen the staff member still has to act on. */}
      {pending.length > 0 && (
        <section className="mb-8 space-y-4">
          <h2 className="text-sm font-semibold text-strong">
            Your head of department has recorded a different score
          </h2>
          {pending.map((row) => {
            const def = CRITERIA.find((c) => c.key === row.criterion)!;
            return (
              <div key={row.criterion} className="bg-surface border border-line rounded-xl shadow-card p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-strong">{def.label}</h3>
                  <Badge tone="warning">Awaiting your response</Badge>
                </div>
                <dl className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <dt className="text-muted text-xs uppercase tracking-wide">Your score</dt>
                    <dd className="text-strong font-semibold tabular-nums text-lg">
                      {fmt(row.staff_score)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted text-xs uppercase tracking-wide">Head&rsquo;s score</dt>
                    <dd className="text-strong font-semibold tabular-nums text-lg">
                      {fmt(row.hod_score)}
                    </dd>
                  </div>
                </dl>
                <div className="mb-4">
                  <p className="text-muted text-xs uppercase tracking-wide mb-1">Their reason</p>
                  <p className="text-body text-sm">{row.hod_justification}</p>
                </div>
                <p className="text-muted text-xs mb-3">
                  If you reject this, the score is held out of your results and referred to the
                  external auditor, whose decision is final.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" disabled={busy} onClick={() => respond(row.criterion, true)}>
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={busy}
                    onClick={() => respond(row.criterion, false)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {sealed ? (
        <SubmittedSummary entry={entry} />
      ) : (
        <>
          <div className="flex items-center gap-2 mb-6" aria-hidden>
            {CRITERIA.map((c, i) => (
              <div key={c.key} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    i <= step ? 'bg-pes' : 'bg-line'
                  }`}
                />
                <p
                  className={`mt-1.5 text-xs font-medium truncate ${
                    i === step ? 'text-pes-700' : 'text-muted'
                  }`}
                >
                  {c.label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-semibold text-strong">{current.label}</h2>
            <p className="text-sm text-muted tabular-nums">
              {isComplete(current.key)
                ? `${runningResult(current.key).toFixed(1)} / 100`
                : `Normalised to 100 from ${criterionMaximum(current.key)} points`}
            </p>
          </div>

          <RatingTable
            parameters={current.parameters}
            ratings={ratingsFor(current.key)}
            onChange={setRating}
            disabled={busy}
          />

          <div className="flex justify-between pt-6">
            <Button variant="secondary" disabled={step === 0 || busy} onClick={() => setStep(step - 1)}>
              Previous
            </Button>
            {step < CRITERIA.length - 1 ? (
              <Button disabled={busy} onClick={next}>
                Save and continue
              </Button>
            ) : (
              <Button disabled={busy} onClick={submit}>
                Submit all four criteria
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** What a staff member sees once they have submitted. Results stay blank until
 *  the organization admin releases the period. */
function SubmittedSummary({ entry }: { entry: Entry }) {
  return (
    <div className="space-y-6">
      <div className="bg-surface border border-line rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-canvas text-left text-xs font-semibold text-muted uppercase tracking-wide">
              <th className="px-4 py-3">Criterion</th>
              <th className="px-4 py-3 text-right">Your score</th>
              <th className="px-4 py-3 text-right">Head&rsquo;s score</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {CRITERIA.map((def) => {
              const row = entry.criteria?.find((c) => c.criterion === def.key);
              return (
                <tr key={def.key}>
                  <td className="px-4 py-3 text-body">{def.label}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-strong">
                    {fmt(row?.staff_score)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-strong">
                    {fmt(row?.hod_score)}
                  </td>
                  <td className="px-4 py-3">{statusBadge(row)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-surface border border-line rounded-xl shadow-card p-5">
        <h3 className="font-semibold text-strong mb-1">Overall performance</h3>
        {entry.released ? (
          <>
            <p className="text-3xl font-semibold text-strong tabular-nums">
              {fmt(entry.overall)}
              <span className="text-base text-muted font-normal"> / 100</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {entry.grade && <Badge tone="brand">{entry.grade}</Badge>}
              {entry.rtp !== null && (
                <span className="text-sm text-muted tabular-nums">
                  RTP {Number(entry.rtp) >= 0 ? '+' : ''}
                  {Number(entry.rtp).toFixed(1)}% against a target of 55
                </span>
              )}
              {entry.class_rank && (
                <Badge tone="neutral">
                  {entry.class_rank} — {entry.descriptive}
                </Badge>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">
            Your result is calculated once the period closes, and shown here when the organization
            releases results.
          </p>
        )}
      </div>
    </div>
  );
}

function statusBadge(row?: CriterionRow) {
  if (!row) return <Badge tone="neutral">Not scored</Badge>;
  if (row.reconciliation === 'awaiting_your_response') {
    return <Badge tone="warning">Awaiting your response</Badge>;
  }
  if (row.reconciliation === 'referred_to_auditor') {
    return <Badge tone="danger">With the auditor</Badge>;
  }
  if (row.reconciliation === 'auditor_final') return <Badge tone="info">Auditor decided</Badge>;
  if (row.reconciliation) return <Badge tone="success">Settled</Badge>;
  return <Badge tone="neutral">Awaiting review</Badge>;
}

function fmt(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(1) : '—';
}
