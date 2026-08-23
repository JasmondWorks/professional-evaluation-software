'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft2 } from 'iconsax-react';
import { notify } from '@/lib/toast';
import { apiFetch } from '@/app/utils/apiFetch';
import Button from '@/app/components/ui/Button';
import PageHeader from '@/app/components/ui/PageHeader';
import Badge from '@/app/components/ui/Badge';
import { CRITERIA, CriterionKey, PERFORMANCE_TARGET } from '@/app/lib/performance/instrument';

// The organization admin's performance console: open a period, close it (which
// also draws the staff who will score each head), run the evaluation, and
// release results.
//
// This page used to let the admin type their own weights and then averaged every
// staff member in the org into a single score. That was neither the model the
// client described nor a per-staff result. The four criteria are fixed by the
// document, the overall is their mean, and each staff member gets their own five
// results — so there is nothing here to weight.

type Period = {
  id: number;
  frequency: string;
  starts_on: string;
  ends_on: string;
  status: string;
  released_at: string | null;
  target: string | number;
  rater_sample: number;
  rater_minimum: number;
};

type Entry = {
  id: number;
  pesuser_name: string;
  dept: string | null;
  status: string;
  flagged?: boolean;
  overall: string | number | null;
  rtp: string | number | null;
  grade: string | null;
  class_rank: string | null;
  descriptive: string | null;
  partial: boolean;
  criteria: { criterion: CriterionKey; recorded_score: string | number | null; staff_score: string | number | null }[];
};

type HodResult = {
  hod_name: string;
  dept: string;
  management?: string | number | null;
  productivity?: string | number | null;
  overall?: string | number | null;
  rtp?: string | number | null;
  grade?: string | null;
  raters?: number;
  belowMinimum?: boolean;
  note?: string;
};

export default function PerformanceConsole() {
  const [period, setPeriod] = useState<Period | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [hods, setHods] = useState<HodResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    frequency: 'annual',
    startsOn: '',
    endsOn: '',
    target: String(PERFORMANCE_TARGET),
    raterSample: '5',
    raterMinimum: '3',
  });

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/performance-v2/period');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not load the performance period.');
        return;
      }
      setPeriod(data.period);
      setError('');

      if (data.period) {
        await loadResults(data.period.id);
      } else {
        setEntries([]);
        setHods([]);
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadResults = async (periodId: number) => {
    const [entryRes, hodRes] = await Promise.all([
      apiFetch(`/api/performance-v2/entry?periodId=${periodId}`),
      apiFetch(`/api/performance-v2/hod-results?periodId=${periodId}`),
    ]);
    const entryData = await entryRes.json();
    const hodData = await hodRes.json();
    setEntries(entryRes.ok ? entryData.entries ?? [] : []);
    setHods(hodRes.ok ? hodData.results ?? [] : []);
  };

  useEffect(() => {
    load();
  }, [load]);

  const post = async (body: any, success: string) => {
    setBusy(true);
    try {
      const res = await apiFetch('/api/performance-v2/period', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error ?? 'That did not work.');
        return null;
      }
      notify.success(success);
      await load();
      return data;
    } catch {
      notify.error('Could not reach the server.');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const open = async () => {
    if (!form.startsOn || !form.endsOn) {
      notify.error('Set the start and end dates.');
      return;
    }
    await post(
      {
        frequency: form.frequency,
        startsOn: form.startsOn,
        endsOn: form.endsOn,
        target: Number(form.target),
        raterSample: Number(form.raterSample),
        raterMinimum: Number(form.raterMinimum),
      },
      'Performance period opened.',
    );
  };

  const close = async () => {
    if (!period) return;
    const result = await post({ action: 'close', periodId: period.id }, 'Period closed.');
    if (result?.warnings?.length) {
      // Departments too small to produce a head's result are worth saying out
      // loud rather than discovering as a blank row later.
      notify.error(
        `${result.warnings.length} department(s) could not be given a full selection. See the heads panel.`,
      );
    } else if (result) {
      notify.success(`${result.raters} staff drawn to score ${result.heads} head(s).`);
    }
  };

  const release = async () => {
    if (!period) return;
    await post({ action: 'release', periodId: period.id }, 'Results released to staff.');
  };

  const evaluate = async () => {
    if (!period) return;
    setBusy(true);
    try {
      const res = await apiFetch('/api/performance-v2/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId: period.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error ?? 'Could not run the evaluation.');
        return;
      }
      notify.success(`Evaluated ${data.evaluated} staff and ${data.heads?.length ?? 0} head(s).`);
      await loadResults(period.id);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-4">
        <Link href="/models" className="inline-flex items-center text-sm text-muted hover:text-pes transition-colors">
          <ArrowLeft2 size="16" className="mr-1" /> Back to models
        </Link>
      </div>

      <PageHeader
        title="Performance measurement"
        subtitle="Competence, integrity, compatibility and use of resources — each normalised to 100, with the overall as their mean, graded against a target of 55."
      />

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 text-sm" role="alert">
          {error}
        </div>
      )}

      {!period ? (
        <section className="bg-surface border border-line rounded-xl shadow-card p-6 mb-8">
          <h2 className="font-semibold text-strong mb-1">Open a performance period</h2>
          <p className="text-sm text-muted mb-5">
            Staff enter their four criteria while the period is open. Closing it draws the staff who
            will score each head of department.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Frequency">
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-line bg-surface text-sm text-strong focus-visible:outline-none focus-visible:shadow-focus"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="biannual">Biannual</option>
                <option value="annual">Annual</option>
              </select>
            </Field>
            <Field label="Starts">
              <input
                type="date"
                value={form.startsOn}
                onChange={(e) => setForm({ ...form, startsOn: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-line bg-surface text-sm text-strong focus-visible:outline-none focus-visible:shadow-focus"
              />
            </Field>
            <Field label="Ends">
              <input
                type="date"
                value={form.endsOn}
                onChange={(e) => setForm({ ...form, endsOn: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-line bg-surface text-sm text-strong focus-visible:outline-none focus-visible:shadow-focus"
              />
            </Field>
            <Field label="RTP target" hint="55 unless your institution has set its own.">
              <input
                type="number"
                min={1}
                max={100}
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-line bg-surface text-sm text-strong focus-visible:outline-none focus-visible:shadow-focus"
              />
            </Field>
            <Field label="Staff drawn per head">
              <input
                type="number"
                min={1}
                value={form.raterSample}
                onChange={(e) => setForm({ ...form, raterSample: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-line bg-surface text-sm text-strong focus-visible:outline-none focus-visible:shadow-focus"
              />
            </Field>
            <Field label="Returns needed" hint="Below this, a head's result is withheld.">
              <input
                type="number"
                min={1}
                value={form.raterMinimum}
                onChange={(e) => setForm({ ...form, raterMinimum: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-line bg-surface text-sm text-strong focus-visible:outline-none focus-visible:shadow-focus"
              />
            </Field>
          </div>
          <div className="pt-5">
            <Button disabled={busy} onClick={open}>
              Open period
            </Button>
          </div>
        </section>
      ) : (
        <section className="bg-surface border border-line rounded-xl shadow-card p-6 mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-strong capitalize">{period.frequency} period</h2>
                <Badge tone={period.status === 'open' ? 'success' : 'neutral'}>{period.status}</Badge>
                {period.released_at && <Badge tone="brand">Released</Badge>}
              </div>
              <p className="text-sm text-muted">
                {period.starts_on?.slice(0, 10)} to {period.ends_on?.slice(0, 10)} · target{' '}
                {Number(period.target)} · {period.rater_sample} staff drawn per head,{' '}
                {period.rater_minimum} returns needed
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {period.status === 'open' && (
                <Button variant="secondary" disabled={busy} onClick={close}>
                  Close and draw raters
                </Button>
              )}
              {period.status === 'closed' && (
                <Button variant="secondary" disabled={busy} onClick={evaluate}>
                  Run evaluation
                </Button>
              )}
              {period.status === 'closed' && !period.released_at && (
                <Button disabled={busy} onClick={release}>
                  Release results
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {period && (
        <>
          <section className="mb-10">
            <h2 className="font-semibold text-strong mb-3">Staff results</h2>
            <div className="bg-surface border border-line rounded-xl shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-canvas text-left text-xs font-semibold text-muted uppercase tracking-wide">
                      <th className="px-4 py-3">Staff</th>
                      <th className="px-4 py-3">Department</th>
                      {CRITERIA.map((c) => (
                        <th key={c.key} className="px-4 py-3 text-right whitespace-nowrap">
                          {c.label}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right">Overall</th>
                      <th className="px-4 py-3 text-right">RTP</th>
                      <th className="px-4 py-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {entries.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-10 text-center text-muted">
                          Nobody has submitted yet.
                        </td>
                      </tr>
                    )}
                    {entries.map((e) => (
                      <tr key={e.id} className="hover:bg-canvas/60">
                        <td className="px-4 py-3 font-medium text-strong whitespace-nowrap">
                          <span className="flex items-center gap-2">
                            {e.pesuser_name}
                            {e.flagged && <Badge tone="danger">Flagged</Badge>}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted">{e.dept ?? '—'}</td>
                        {CRITERIA.map((c) => {
                          const row = e.criteria?.find((r) => r.criterion === c.key);
                          return (
                            <td key={c.key} className="px-4 py-3 text-right tabular-nums text-body">
                              {fmt(row?.recorded_score ?? row?.staff_score)}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-strong">
                          {fmt(e.overall)}
                          {e.partial && <span className="text-warning-700" title="Not all four criteria are settled"> *</span>}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-body">
                          {e.rtp === null || e.rtp === undefined
                            ? '—'
                            : `${Number(e.rtp) >= 0 ? '+' : ''}${Number(e.rtp).toFixed(1)}%`}
                        </td>
                        <td className="px-4 py-3">
                          {e.grade ? <Badge tone={gradeTone(e.grade)}>{e.grade}</Badge> : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {entries.some((e) => e.partial) && (
              <p className="text-xs text-muted mt-2">
                * The overall covers only the criteria that have been settled. Criteria still awaiting
                a response or an auditor&rsquo;s decision are left out rather than counted as zero.
              </p>
            )}
          </section>

          <section>
            <h2 className="font-semibold text-strong mb-1">Heads of department</h2>
            <p className="text-sm text-muted mb-3">
              Scored by staff drawn at random from their own department, on management and
              productivity (full document, pages 102&ndash;103).
            </p>
            <div className="bg-surface border border-line rounded-xl shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-canvas text-left text-xs font-semibold text-muted uppercase tracking-wide">
                      <th className="px-4 py-3">Head</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3 text-right">Management</th>
                      <th className="px-4 py-3 text-right">Productivity</th>
                      <th className="px-4 py-3 text-right">Overall</th>
                      <th className="px-4 py-3 text-right">RTP</th>
                      <th className="px-4 py-3">Grade</th>
                      <th className="px-4 py-3 text-right">Returns</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {hods.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-muted">
                          No head results yet. Close the period to draw raters, then run the evaluation.
                        </td>
                      </tr>
                    )}
                    {hods.map((h) => (
                      <tr key={h.hod_name} className="hover:bg-canvas/60">
                        <td className="px-4 py-3 font-medium text-strong">{h.hod_name}</td>
                        <td className="px-4 py-3 text-muted">{h.dept}</td>
                        {h.belowMinimum ? (
                          <td colSpan={5} className="px-4 py-3 text-warning-700">
                            {h.note}
                          </td>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-right tabular-nums text-body">{fmt(h.management)}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-body">{fmt(h.productivity)}</td>
                            <td className="px-4 py-3 text-right tabular-nums font-semibold text-strong">
                              {fmt(h.overall)}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-body">
                              {h.rtp === null || h.rtp === undefined
                                ? '—'
                                : `${Number(h.rtp) >= 0 ? '+' : ''}${Number(h.rtp).toFixed(1)}%`}
                            </td>
                            <td className="px-4 py-3">
                              {h.grade ? <Badge tone={gradeTone(h.grade)}>{h.grade}</Badge> : '—'}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3 text-right tabular-nums text-muted">{h.raters ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted mt-1">{hint}</span>}
    </label>
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
