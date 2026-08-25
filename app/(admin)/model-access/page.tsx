'use client';

import { useEffect, useState } from 'react';
import { Alert, Badge, Card, CardBody, CardHeader, PageHeader, Skeleton, Switch } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';
import type { ModelDefinition } from '@/app/lib/models/catalog';

// The organization admin decides which models the industrial/production engineer
// may enter data into.
//
// Access is opt-in and off by default, so a model added to the platform later is
// closed until somebody here opens it. Running a model — evaluating, releasing,
// downloading results — is never granted by this screen; that stays with the
// admin whatever is switched on.

type AccessRow = {
  key: string;
  enabled: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
};

export default function ModelAccessPage() {
  const [catalog, setCatalog] = useState<ModelDefinition[]>([]);
  const [access, setAccess] = useState<AccessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/model-access?scope=manage');
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Could not load model access.');
          return;
        }
        setCatalog(data.catalog ?? []);
        setAccess(data.access ?? []);
      } catch {
        setError('Could not reach the server.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function toggle(model: string, enabled: boolean) {
    setSaving(model);
    setError('');
    // Move the switch immediately; put it back if the server disagrees.
    setAccess((prev) => prev.map((r) => (r.key === model ? { ...r, enabled } : r)));
    try {
      const res = await apiFetch('/api/model-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, enabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save that change.');
      setAccess(data.access);
      notify.success(enabled ? 'Access granted.' : 'Access removed.');
    } catch (err: any) {
      setAccess((prev) => prev.map((r) => (r.key === model ? { ...r, enabled: !enabled } : r)));
      setError(err.message ?? 'Could not save that change.');
    } finally {
      setSaving(null);
    }
  }

  const enabledCount = access.filter((r) => r.enabled).length;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Model access"
        subtitle="Choose which models the industrial / production engineer can enter data into. Running a model and releasing its results stays with you."
      />

      {error ? (
        <Alert tone="danger" className="mb-6">
          {error}
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-strong">Industrial / production engineer</h2>
              <p className="mt-0.5 text-sm text-muted">
                Data entry only. With nothing switched on, this role sees no Models section at
                all.
              </p>
            </div>
            <Badge tone={enabledCount > 0 ? 'success' : 'neutral'}>
              {enabledCount} of {access.length || catalog.length} enabled
            </Badge>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex flex-col gap-px bg-line">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-surface p-5">
                  <Skeleton className="h-10" />
                </div>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {catalog.map((model) => {
                const row = access.find((r) => r.key === model.key);
                const enabled = row?.enabled ?? false;
                return (
                  <li
                    key={model.key}
                    className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-strong">{model.label}</p>
                      <p className="mt-0.5 text-sm text-muted">{model.description}</p>
                      {row?.updatedAt && row.updatedBy ? (
                        <p className="mt-1 text-xs text-muted">
                          Last changed by {row.updatedBy} on{' '}
                          {new Date(row.updatedAt).toLocaleDateString()}
                        </p>
                      ) : null}
                    </div>
                    <Switch
                      checked={enabled}
                      disabled={saving === model.key}
                      onCheckedChange={(next: boolean) => toggle(model.key, next)}
                      aria-label={`${enabled ? 'Remove' : 'Grant'} access to ${model.label}`}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      <p className="mt-4 text-sm text-muted">
        Every other role — academic and non-academic staff, heads of department, the auditor —
        has no access to the models, and this is enforced on the server as well as in the
        navigation.
      </p>
    </main>
  );
}
