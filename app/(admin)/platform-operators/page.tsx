'use client';

// The accounts that can see across every organization.
//
// Last page out of the legacy /admin console. It was a server component
// holding a direct prisma query with no authorization at all — anyone,
// signed in or not, could read every operator's name and email — and it was
// the only screen in that shell with no equivalent in the main app, which is
// why the shell could not simply be deleted.

import { useEffect, useState } from 'react';
import { Alert, Card, CardBody, Empty, PageHeader, Skeleton } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';

type Operator = { id: string; name: string; email: string };

export default function PlatformOperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await apiFetch('/api/admin/super-admins', { method: 'GET' });
        const body = await res.json();
        if (!live) return;
        if (!res.ok) {
          throw new Error(
            res.status === 403
              ? 'Only a platform operator can view this.'
              : body.error ?? 'Could not load platform operators.',
          );
        }
        setOperators(body);
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

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Platform operators"
        subtitle="Accounts that reach every organization on PES, rather than belonging to one."
      />

      {error ? (
        <Alert tone="danger" className="mb-6">
          {error}
        </Alert>
      ) : loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : operators.length === 0 ? (
        <Empty title="No platform operators" />
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {operators.map((op) => (
            <li key={op.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <div className="font-semibold capitalize text-strong">{op.name}</div>
                <a href={`mailto:${op.email}`} className="text-sm text-pes underline">
                  {op.email}
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Promotion is deliberately not a route: granting the tier that reads
          every tenant's data should not be reachable over HTTP. The console's
          old "Add New" button posted to an endpoint that never existed. */}
      <p className="mt-6 max-w-prose text-sm text-muted">
        Promote an account with{' '}
        <code className="rounded bg-canvas px-1 py-0.5 text-[13px]">
          npx tsx scripts/promote-super-admin.ts &lt;email&gt;
        </code>
        . This is not available in the interface on purpose.
      </p>
    </div>
  );
}
