'use client';

import { useState } from 'react';
import { Alert, Button, Card, CardBody, CardHeader, Field, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';
import { APPRAISAL_PERIOD_FREQUENCIES } from '@/app/lib/appraisal/instrument';

export type Period = {
  id: number;
  frequency: string;
  starts_on: string;
  ends_on: string;
  status: string;
  opened_by: string | null;
};

const FREQUENCY_LABELS: Record<string, string> = {
  yearly: 'Yearly',
  bi_annual: 'Twice a year',
  quarterly: 'Quarterly',
};

/** The root of the appraisal flow. Nothing else can happen until Estab./Personnel
 *  opens a period, so this panel is deliberately the first thing on the page. */
export default function PeriodPanel({
  period,
  onChange,
}: {
  period: Period | null;
  onChange: (p: Period | null) => void;
}) {
  const [frequency, setFrequency] = useState('yearly');
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const datesValid = startsOn !== '' && endsOn !== '' && endsOn > startsOn;

  async function open() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch('/api/appraisal-v2/period', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency, startsOn, endsOn }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not open the period.');
      onChange(data.period);
      notify.success('Appraisal period opened. Staff can now begin entering forms.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function close() {
    if (!period) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch('/api/appraisal-v2/period', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId: period.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not close the period.');
      onChange(null);
      notify.success('Period closed. Results can now be released.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (period) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-strong">Appraisal period open</h2>
              <p className="text-sm text-muted mt-0.5">
                {FREQUENCY_LABELS[period.frequency] ?? period.frequency}
                {', '}
                {new Date(period.starts_on).toLocaleDateString()} to{' '}
                {new Date(period.ends_on).toLocaleDateString()}
                {period.opened_by ? ` · opened by ${period.opened_by}` : null}
              </p>
            </div>
            <Button variant="outline" onClick={close} loading={busy}>
              Close period
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}
          <p className="text-sm text-body">
            Forms can be entered while the period is open. Results stay hidden from staff
            and heads of department until it is closed and the organization admin releases
            them.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-strong">Open an appraisal period</h2>
        <p className="text-sm text-muted mt-0.5">
          Every score belongs to a period, so nothing can be entered until one is open.
        </p>
      </CardHeader>
      <CardBody>
        {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Frequency">
            {(f) => (
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id={f.id}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPRAISAL_PERIOD_FREQUENCIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {FREQUENCY_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            )}
          </Field>
          <Field label="Starts on">
            {(f) => (
            <input
              id={f.id}
              type="date"
              value={startsOn}
              onChange={(e) => setStartsOn(e.target.value)}
              className="block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition-shadow focus:border-pes-400 focus-visible:shadow-focus"
            />
            )}
          </Field>
          <Field label="Ends on">
            {(f) => (
            <input
              id={f.id}
              type="date"
              value={endsOn}
              onChange={(e) => setEndsOn(e.target.value)}
              className="block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition-shadow focus:border-pes-400 focus-visible:shadow-focus"
            />
            )}
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            onClick={() =>
              datesValid
                ? open()
                : setError(
                    startsOn === "" || endsOn === ""
                      ? "Set both dates to continue."
                      : "The end date must fall after the start date.",
                  )
            }
            aria-disabled={!datesValid}
            className={!datesValid ? "opacity-50" : undefined}
            loading={busy}
          >
            Open period
          </Button>
          {/* AGENTS.md: a disabled control must say why on screen. */}
          {!datesValid ? (
            <p className="text-sm text-muted">
              {startsOn === '' || endsOn === ''
                ? 'Set both dates to continue.'
                : 'The end date must fall after the start date.'}
            </p>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
