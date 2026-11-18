'use client';

// An auditor's own control over whether PES may show their credentials
// platform-wide.
//
// Consent is collected once as the last of thirteen yes/no questions on the
// accept form, where it reads like every other question and is impossible to
// find again afterwards. This is the same decision, named, explained, and
// reversible — on the auditor's own profile, which is the only account that may
// change it.

import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Switch,
} from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';

export default function RecognitionConsentCard() {
  const [consent, setConsent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await apiFetch('/api/auditor-consent', { method: 'GET' });
        const body = await res.json();
        if (!live) return;
        if (!res.ok) throw new Error(body.error ?? 'Could not read your consent setting.');
        setConsent(Boolean(body.consent));
        setError(null);
      } catch (err: any) {
        if (live) setError(err.message);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  const change = async (next: boolean) => {
    // Optimistic, with the previous value kept so a failure puts the control
    // back where it was rather than leaving it showing a state the server
    // never accepted.
    const previous = consent;
    setConsent(next);
    setSaving(true);
    setError(null);

    try {
      const res = await apiFetch('/api/auditor-consent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: next }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Your consent setting could not be saved.');

      notify.success(
        next
          ? 'Your credentials are now visible to organizations across PES.'
          : 'Your credentials are no longer visible outside the organization that invited you.',
      );
    } catch (err: any) {
      setConsent(previous);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // A signed-in auditor with no submission row cannot consent to anything, and
  // saying so is more use than an empty switch.
  if (!loading && consent === null) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-strong">Recognition by PES</h2>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-body">
            {error ?? 'No auditor submission is attached to this account.'}
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-strong">Recognition by PES</h2>
          {!loading && (
            <Badge tone={consent ? 'success' : 'neutral'}>
              {consent ? 'Granted' : 'Not granted'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-6">
              <div className="max-w-prose">
                <label
                  htmlFor="recognition-consent"
                  className="block text-sm font-medium text-strong"
                >
                  Let organizations across PES see my credentials
                </label>
                <p className="mt-1 text-sm text-body">
                  Your uploaded certificates become visible to the platform operator and
                  to organizations looking for a recognized external auditor. Turning
                  this off hides them again.
                </p>
              </div>
              <Switch
                id="recognition-consent"
                checked={Boolean(consent)}
                disabled={saving}
                onCheckedChange={change}
                aria-describedby="recognition-consent-note"
              />
            </div>

            {/* The one thing that is not obvious from the switch: turning it off
                does not withdraw the documents from the organization that asked
                for them. Said here rather than discovered later. */}
            <p id="recognition-consent-note" className="text-sm text-muted">
              The organization that invited you can always see the credentials you
              uploaded when you accepted their invitation, whichever way this is set.
            </p>

            {error ? <Alert tone="danger">{error}</Alert> : null}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
