'use client';

import { useCallback, useEffect, useState } from 'react';
import { notify } from '@/lib/toast';
import { apiFetch } from '@/app/utils/apiFetch';
import Button from '@/app/components/ui/Button';
import PageHeader from '@/app/components/ui/PageHeader';
import { CRITERIA, CriterionKey } from '@/app/lib/performance/instrument';

// The external auditor's queue. A staff member who rejected their head's score
// has it held out of their results until the auditor rules; that figure is final
// and replaces both.

type Row = {
  id: number;
  criterion: CriterionKey;
  staff_score: string | number | null;
  hod_score: string | number | null;
  hod_justification: string | null;
};

type Entry = {
  id: number;
  pesuser_name: string;
  dept: string | null;
  criteria: Row[];
};

export default function PerformanceAuditor() {
  const [queue, setQueue] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Record<string, { score: string; note: string }>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/performance-v2/auditor');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not load the queue.');
        return;
      }
      setQueue(data.queue ?? []);
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

  const decide = async (entryId: number, criterion: CriterionKey) => {
    const key = `${entryId}:${criterion}`;
    const d = draft[key];
    const score = Number(d?.score);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      notify.error('Enter a score between 0 and 100.');
      return;
    }

    setBusy(true);
    try {
      const res = await apiFetch('/api/performance-v2/auditor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, criterion, score, note: d?.note }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error ?? 'Could not record your decision.');
        return;
      }
      notify.success('Recorded. This figure is final.');
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
        title="Performance auditing"
        subtitle="Scores referred here were rejected by the staff member. Your figure is final."
      />

      {error && (
        <div className="p-4 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 text-sm" role="alert">
          {error}
        </div>
      )}

      {!error && queue.length === 0 && (
        <p className="px-3 py-10 text-center text-sm text-muted">Nothing is awaiting a decision.</p>
      )}

      <div className="space-y-3">
        {queue.map((entry) => (
          <div key={entry.id} className="bg-surface border border-line rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-line">
              <p className="font-medium text-strong">{entry.pesuser_name}</p>
              <p className="text-sm text-muted">{entry.dept}</p>
            </div>
            <div className="divide-y divide-line">
              {entry.criteria.map((row) => {
                const def = CRITERIA.find((c) => c.key === row.criterion);
                const key = `${entry.id}:${row.criterion}`;
                const d = draft[key] ?? { score: '', note: '' };
                return (
                  <div key={row.id} className="p-5 space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-strong">{def?.label ?? row.criterion}</h3>
                      <p className="text-sm text-muted tabular-nums">
                        Staff <span className="text-strong font-semibold">{fmt(row.staff_score)}</span>
                        {' · '}
                        Head <span className="text-strong font-semibold">{fmt(row.hod_score)}</span>
                      </p>
                    </div>
                    {row.hod_justification && (
                      <p className="text-sm text-muted">
                        Head&rsquo;s reason: {row.hod_justification}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <label className="w-40">
                        <span className="block text-xs font-medium text-muted mb-1">
                          Final score (0&ndash;100)
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
                      <label className="flex-1 min-w-[200px]">
                        <span className="block text-xs font-medium text-muted mb-1">Note (optional)</span>
                        <input
                          type="text"
                          value={d.note}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, [key]: { ...d, note: e.target.value } }))
                          }
                          className="w-full h-10 px-3 rounded-lg border border-line bg-surface text-sm text-strong focus-visible:outline-none focus-visible:shadow-focus"
                        />
                      </label>
                    </div>
                    <Button size="sm" disabled={busy} onClick={() => decide(entry.id, row.criterion)}>
                      Record final decision
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function fmt(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(1) : '—';
}
