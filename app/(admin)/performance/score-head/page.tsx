'use client';

import { useCallback, useEffect, useState } from 'react';
import { notify } from '@/lib/toast';
import { apiFetch } from '@/app/utils/apiFetch';
import Button from '@/app/components/ui/Button';
import PageHeader from '@/app/components/ui/PageHeader';
import Badge from '@/app/components/ui/Badge';
import RatingTable from '@/app/components/performance/RatingTable';
import { HOD_CRITERIA } from '@/app/lib/performance/instrument';

// "the software should be able to randomly select staff that will score the HOD
//  on their performance subject to HOD performance criteria which is just two as
//  provided in the full and complete document pages 102-103."
//
// This is that screen. It appears only for the staff drawn in the period's
// selection, and only until they have returned their score. The head is never
// shown who was drawn, so this stays a plain task rather than an exposure.

type Assignment = {
  id: number;
  periodId: number;
  periodStatus: string;
  dept: string;
  hodName: string;
  submitted: boolean;
};

export default function ScoreHead() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [active, setActive] = useState<Assignment | null>(null);
  const [ratings, setRatings] = useState<Record<string, Record<number, number>>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/performance-v2/hod-scoring');
      const data = await res.json();
      setAssignments(data.assignments ?? []);
    } catch {
      notify.error('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setRating = (criterion: string) => (index: number, value: number) =>
    setRatings((prev) => ({
      ...prev,
      [criterion]: { ...(prev[criterion] ?? {}), [index]: value },
    }));

  const complete = HOD_CRITERIA.every((c) =>
    c.parameters.every((_p, i) => typeof ratings[c.key]?.[i] === 'number'),
  );

  const submit = async () => {
    if (!active) return;
    if (!complete) {
      notify.error('Rate every row on both criteria before submitting.');
      return;
    }

    setBusy(true);
    try {
      const res = await apiFetch('/api/performance-v2/hod-scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: active.id,
          management: HOD_CRITERIA[0].parameters.map((_p, i) => ratings.management[i]),
          productivity: HOD_CRITERIA[1].parameters.map((_p, i) => ratings.productivity[i]),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error ?? 'Could not record your score.');
        return;
      }
      notify.success('Recorded. Your score is combined with the others and never shown individually.');
      setActive(null);
      setRatings({});
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

  const outstanding = assignments.filter((a) => !a.submitted);

  if (active) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <PageHeader
          title={`Score ${active.hodName}`}
          subtitle="Your answers are pooled with the other selected staff. Neither the head nor anyone else sees your individual score."
        />
        <div className="space-y-8">
          {HOD_CRITERIA.map((c) => (
            <section key={c.key}>
              <h2 className="font-semibold text-strong mb-3">{c.label}</h2>
              <RatingTable
                parameters={c.parameters}
                ratings={ratings[c.key] ?? {}}
                onChange={setRating(c.key)}
                showPoints={false}
                disabled={busy}
              />
            </section>
          ))}
        </div>
        <div className="flex justify-between pt-6">
          <Button variant="secondary" disabled={busy} onClick={() => setActive(null)}>
            Back
          </Button>
          <Button disabled={busy || !complete} onClick={submit}>
            Submit score
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Score your head of department"
        subtitle="You were selected at random to score the head of your department on management and productivity."
      />

      {assignments.length === 0 ? (
        <p className="px-3 py-10 text-center text-sm text-muted">
          You have not been selected to score anyone this period.
        </p>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-surface border border-line rounded-xl shadow-card px-5 py-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-strong truncate">{a.hodName}</p>
                <p className="text-sm text-muted truncate">{a.dept}</p>
              </div>
              {a.submitted ? (
                <Badge tone="success">Submitted</Badge>
              ) : (
                <Button size="sm" onClick={() => setActive(a)}>
                  Score
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {outstanding.length > 0 && (
        <p className="text-xs text-muted mt-6">
          You can submit each score once. A head&rsquo;s result is only published when enough of the
          selected staff have responded.
        </p>
      )}
    </div>
  );
}
