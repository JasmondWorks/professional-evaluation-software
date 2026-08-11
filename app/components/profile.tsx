'use client';

import { useEffect, useState } from 'react';
import { TickCircle, MinusCirlce, Hierarchy } from 'iconsax-react';
import { Alert, Badge, Card, CardBody, CardHeader, PageHeader, Skeleton } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { PERMISSION_TREE, PermissionKey } from './utils/roles';
import { usePermissions } from './usePermissions';
import ProfileChunk from './Profilechunk';

type ReportingLine = {
  reportsTo: { name: string; role: string | null; dept: string | null } | null;
  dept: string | null;
};

export default function Profile() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Your profile"
        subtitle="Your record as the organization holds it, and what your role lets you do."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-strong">Your details</h2>
          </CardHeader>
          <CardBody>
            <ProfileChunk editable />
          </CardBody>
        </Card>

        <ReportingLineCard />
        <PermissionsCard />
      </div>
    </div>
  );
}

/** Who this person reports to. Reads the real assignment rather than showing an
 *  empty box, and says plainly when no line has been set. */
function ReportingLineCard() {
  const [data, setData] = useState<ReportingLine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/my-reporting-line');
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Could not load your reporting line.');
        if (!cancelled) setData(body);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-strong">Reporting line</h2>
        <p className="mt-0.5 text-sm text-muted">
          Set by your organization from your role and department. Ask an administrator to
          change it.
        </p>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Skeleton className="h-5 w-56 rounded-full" />
        ) : error ? (
          <Alert tone="danger">{error}</Alert>
        ) : data?.reportsTo ? (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pes-50 text-pes-700">
              <Hierarchy size={18} variant="Bold" />
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted">You report to</p>
              <p className="text-base font-semibold text-strong">{data.reportsTo.name}</p>
              <p className="text-sm text-muted">
                {[data.reportsTo.role, data.reportsTo.dept].filter(Boolean).join(' · ') ||
                  'Role not recorded'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-body">
            No reporting line has been set for you yet
            {data?.dept ? ` in ${data.dept}` : ''}. Your head of department can assign one.
          </p>
        )}
      </CardBody>
    </Card>
  );
}

/** What this person is actually allowed to do.
 *
 *  This used to be a block of hardcoded ticked checkboxes: every user saw the
 *  same five permissions marked as granted, whatever their role. It now reads
 *  the capabilities carried in the token, against the same PERMISSION_TREE the
 *  role editor renders from, so the two can never disagree.
 *
 *  These are read-only here, so they are not drawn as checkboxes. A checkbox
 *  that cannot be changed promises an action the page will not honour. */
function PermissionsCard() {
  const { can } = usePermissions();
  const granted = PERMISSION_TREE.filter((node) => can(node.key));
  const total = PERMISSION_TREE.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-strong">What you can do</h2>
            <p className="mt-0.5 text-sm text-muted">
              Granted by your role. To change them, ask whoever manages roles in your
              organization.
            </p>
          </div>
          <Badge tone={granted.length > 0 ? 'brand' : 'neutral'}>
            {granted.length} of {total}
          </Badge>
        </div>
      </CardHeader>
      <CardBody>
        {/* Holding none of these is normal, not a fault: they are administrative
            capabilities, and roles such as lecturer are not given any. Say so
            plainly rather than leaving a bare zero that reads as an error. */}
        {granted.length === 0 ? (
          <p className="mb-4 text-sm text-body">
            Your role does not include any of the administrative permissions below. You can
            still do everything your role covers, such as entering your own data and viewing
            your results.
          </p>
        ) : null}

        <ul className="divide-y divide-line">
            {PERMISSION_TREE.map((node) => {
              const held = can(node.key);
              const scopes = node.children.filter((c) => can(c.key as PermissionKey));
              return (
                <li key={node.key} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 shrink-0 ${held ? 'text-success-700' : 'text-muted'}`}
                  >
                    {held ? (
                      <TickCircle size={20} variant="Bold" />
                    ) : (
                      <MinusCirlce size={20} variant="Linear" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${held ? 'text-strong' : 'text-muted'}`}>
                      {node.label}
                      <span className="sr-only">{held ? ': granted' : ': not granted'}</span>
                    </p>
                    <p className={`mt-0.5 text-sm ${held ? 'text-body' : 'text-muted'}`}>
                      {node.description}
                    </p>

                    {held && node.children.length > 0 ? (
                      scopes.length > 0 ? (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {scopes.map((c) => (
                            <li
                              key={c.key}
                              className="rounded-full bg-pes-50 px-2.5 py-0.5 text-xs font-medium text-pes-700"
                            >
                              {c.label}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-muted">
                          No scope set, so this applies to nobody until one is chosen.
                        </p>
                      )
                    ) : null}
                  </div>
                </li>
              );
            })}
        </ul>
      </CardBody>
    </Card>
  );
}
