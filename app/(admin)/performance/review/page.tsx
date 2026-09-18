'use client';

import { useCallback, useEffect, useState } from 'react';
import { notify } from '@/lib/toast';
import { apiFetch } from '@/app/utils/apiFetch';
import Button from '@/app/components/ui/Button';
import PageHeader from '@/app/components/ui/PageHeader';
import Badge from '@/app/components/ui/Badge';
import { CRITERIA, CriterionKey } from '@/app/lib/performance/instrument';

// The head of department reviews their department's performance results and may
// object to any criterion by recording their own score with a reason. The staff
// member then accepts or rejects; a rejection goes to the external auditor.
//
// The head is never told whether their score fell inside the tolerance band —
// only that it was recorded. See the confidentiality note in the service.

type CriterionRow = {
  criterion: CriterionKey;
  staff_score: string | number | null;
  hod_score: string | number | null;
  hod_justification: string | null;
  staff_accepted: boolean | null;
  reconciliation: string | null;
  recorded_score: string | number | null;
};

type Entry = {
  id: number;
  pesuser_name: string;
  status: string;
  overall: string | number | null;
  rtp: string | number | null;
  grade: string | null;
  class_rank: string | null;
  descriptive: string | null;
  partial: boolean;
  criteria: CriterionRow[];
};

export default function PerformanceReview() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, { score: string; reason: string }>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const periodRes = await apiFetch('/api/performance-v2/period');
      const { period } = await periodRes.json();
      if (!period) {
        setError('No performance period is open.');
        return;
      }
      const res = await apiFetch(`/api/performance-v2/entry?periodId=${period.id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not load your department.');
        return;
      }
      // Only submitted records can be objected to.
      setEntries((data.entries ?? []).filter((e: Entry) => e.status !== 'draft'));
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

  const object = async (entryId: number, criterion: CriterionKey) => {
    const key = `${entryId}:${criterion}`;
    const d = draft[key];
    if (!d?.reason?.trim()) {
      notify.error('A written reason is required before you can change a score.');
      return;
    }
    const score = Number(d.score);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      notify.error('Enter a score between 0 and 100.');
      return;
    }

    setBusy(true);
    try {
      const res = await apiFetch('/api/performance-v2/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, criterion, hodScore: score, justification: d.reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error ?? 'Could not record your score.');
        return;
      }
      notify.success('Recorded. The staff member has been asked to accept or reject it.');
      setDraft((prev) => ({ ...prev, [key]: { score: '', reason: '' } }));
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Performance review"
        subtitle="Your department's submitted results. Object to any criterion by recording your own score with a reason."
      />

      {error && (
        <div className="p-4 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 text-sm" role="alert">
          {error}
        </div>
      )}

      {!error && entries.length === 0 && (
        <p className="px-3 py-10 text-center text-sm text-muted">
          Nobody in your department has submitted their performance yet.
        </p>
      )}

      <div className="space-y-3">
        {entries.map((entry) => {
          const expanded = open === String(entry.id);
          return (
            <div key={entry.id} className="bg-surface border border-line rounded-xl shadow-card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : String(entry.id))}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-canvas/60 transition-colors"
              >
                <span className="font-medium text-strong">{entry.pesuser_name}</span>
                <span className="flex items-center gap-2">
                  <span className="text-sm text-muted tabular-nums hidden sm:inline">
                    Overall <span className="text-strong font-semibold">{fmt(entry.overall)}</span>
                  </span>
                  {entry.grade && <Badge tone={gradeTone(entry.grade)}>{entry.grade}</Badge>}
                  {entry.status === 'referred_to_auditor' && <Badge tone="danger">With the auditor</Badge>}
                  {entry.status === 'awaiting_staff' && <Badge tone="warning">Awaiting their response</Badge>}
                  <span className="text-muted text-sm">{expanded ? 'Hide' : 'Review'}</span>
                </span>
              </button>

              {expanded && (
                <div className="border-t border-line divide-y divide-line">
                  {/* The five results the client asked the head to be able to
                      view: the four criteria and the overall, with its RTP
                      grading against the target of 55. */}
                  <div className="px-5 py-4 bg-canvas/50">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {CRITERIA.map((def) => {
                        const row = entry.criteria?.find((c) => c.criterion === def.key);
                        return (
                          <div key={def.key}>
                            <p className="text-[11px] uppercase tracking-wide text-muted truncate">
                              {def.label}
                            </p>
                            <p className="text-lg font-semibold text-strong tabular-nums">
                              {fmt(row?.recorded_score ?? row?.staff_score)}
                            </p>
                          </div>
                        );
                      })}
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted">Overall</p>
                        <p className="text-lg font-semibold text-strong tabular-nums">
                          {fmt(entry.overall)}
                          {entry.partial && (
                            <span className="text-warning-700" title="Not all four criteria are settled">
                              {' '}*
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {entry.grade && <Badge tone={gradeTone(entry.grade)}>{entry.grade}</Badge>}
                      {entry.rtp !== null && entry.rtp !== undefined && (
                        <span className="text-xs text-muted tabular-nums">
                          RTP {Number(entry.rtp) >= 0 ? '+' : ''}
                          {Number(entry.rtp).toFixed(1)}% against a target of 55
                        </span>
                      )}
                      {entry.class_rank && (
                        <Badge tone="neutral">
                          {entry.class_rank} &mdash; {entry.descriptive}
                        </Badge>
                      )}
                    </div>
                    {entry.partial && (
                      <p className="text-xs text-muted mt-2">
                        * The overall covers only the criteria that have been settled.
                      </p>
                    )}
                  </div>

                  {CRITERIA.map((def) => {
                    const row = entry.criteria?.find((c) => c.criterion === def.key);
                    const key = `${entry.id}:${def.key}`;
                    const d = draft[key] ?? { score: '', reason: '' };
                    const alreadyObjected = row?.hod_score !== null && row?.hod_score !== undefined;

                    return (
                      <div key={def.key} className="p-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                          <h3 className="font-semibold text-strong">{def.label}</h3>
                          <p className="text-sm text-muted tabular-nums">
                            Their score:{' '}
                            <span className="text-strong font-semibold">{fmt(row?.staff_score)}</span> / 100
                          </p>
                        </div>

                        {alreadyObjected ? (
                          <div className="text-sm space-y-1">
                            <p className="text-body">
                              You recorded <span className="font-semibold tabular-nums">{fmt(row?.hod_score)}</span>.
                            </p>
                            <p className="text-muted">{row?.hod_justification}</p>
                            <p className="pt-1">
                              {row?.staff_accepted === null || row?.staff_accepted === undefined ? (
                                <Badge tone="warning">Awaiting their response</Badge>
                              ) : row?.staff_accepted ? (
                                <Badge tone="success">They accepted</Badge>
                              ) : (
                                <Badge tone="danger">They rejected — with the auditor</Badge>
                              )}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-3">
                              <label className="flex-1 min-w-[140px]">
                                <span className="block text-xs font-medium text-muted mb-1">
                                  Your score (0&ndash;100)
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step="0.01"
                                  value={d.score}
                                  onChange={(e) =>
                                    setDraft((prev) => ({ ...prev, [key]: { ...d, score: e.target.value } }))
                                  }
                                  className="w-full h-10 px-3 rounded-lg border border-line bg-surface text-sm text-strong focus-visible:outline-none focus-visible:shadow-focus"
                                />
                              </label>
                            </div>
                            <label className="block">
                              <span className="block text-xs font-medium text-muted mb-1">
                                Reason (required)
                              </span>
                              <textarea
                                rows={2}
                                value={d.reason}
                                onChange={(e) =>
                                  setDraft((prev) => ({ ...prev, [key]: { ...d, reason: e.target.value } }))
                                }
                                placeholder="Why does this score differ from theirs?"
                                className="w-full px-3 py-2 rounded-lg border border-line bg-surface text-sm text-strong focus-visible:outline-none focus-visible:shadow-focus"
                              />
                            </label>
                            <Button size="sm" disabled={busy} onClick={() => object(entry.id, def.key)}>
                              Record my score
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function gradeTone(grade: string) {
  if (grade === 'Excellent') return 'success' as const;
  if (grade === 'Very Good') return 'brand' as const;
  if (grade === 'Good') return 'info' as const;
  if (grade === 'Fair') return 'warning' as const;
  return 'danger' as const;
}

function fmt(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(1) : '—';
}
