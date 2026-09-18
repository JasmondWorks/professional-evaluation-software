'use client';

// The employee record: identity details, the stress-results access an admin
// grants, the reporting line read from the HOD assignments, and this
// employee's live capability grants.

import { useEffect, useMemo, useState } from 'react';
import { GitBranch, ShieldCheck } from 'lucide-react';
import { notify } from '@/lib/toast';
import { apiFetch } from '@/app/utils/apiFetch';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Switch,
} from '@/app/components/ui';
import PermissionSelector from '@/app/components/ui/PermissionSelector';
import { PERMISSION_KEYS, PermissionKey } from '@/app/components/utils/roles';

export type Employee = {
  id: number;
  name: string;
  email: string;
  gsm: string;
  role: string;
  address: string;
  faculty_college: string;
  dob: string;
  doa: string;
  poa: string;
  doc: string;
  post: string;
  dopp: string;
  level: string;
  image: string;
  org: string;
  view_department_stress?: boolean;
  view_faculty_stress?: boolean;
};

const asDate = (v?: string | null) => (v ? String(v).split('T')[0] : null);

/** Label + value pair. Missing values read as "Not recorded", never as blank. */
function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`text-sm mt-0.5 break-words ${value ? 'font-medium text-strong' : 'text-muted'}`}>
        {value || 'Not recorded'}
      </dd>
    </div>
  );
}

export default function EmployeeProfile({
  user,
  loading,
  onUserChange,
}: {
  user: Employee | null;
  loading: boolean;
  onUserChange: (patch: Partial<Employee>) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // ---- Permissions -------------------------------------------------------
  const [perms, setPerms] = useState<Partial<Record<PermissionKey, boolean>> | null>(null);
  const [savedPerms, setSavedPerms] = useState<Partial<Record<PermissionKey, boolean>> | null>(null);
  const [permsConfigured, setPermsConfigured] = useState(true);
  const [canEditPerms, setCanEditPerms] = useState(false);
  const [permsError, setPermsError] = useState<string | null>(null);
  const [savingPerms, setSavingPerms] = useState(false);

  // ---- Reporting line ----------------------------------------------------
  const [reporting, setReporting] = useState<{ name: string; role: string | null; dept: string | null } | null>(null);
  const [reportingLoaded, setReportingLoaded] = useState(false);

  const id = user?.id;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch('/api/employee-permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
        if (cancelled) return;
        setPerms(data.permissions);
        setSavedPerms(data.permissions);
        setPermsConfigured(data.configured !== false);
        setCanEditPerms(data.canEdit === true);
      } catch (e) {
        if (!cancelled) setPermsError(e instanceof Error ? e.message : 'Could not load permissions.');
      }
    })();

    (async () => {
      try {
        const res = await apiFetch('/api/employee-reporting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (!cancelled && res.ok) setReporting(data.reports_to ?? null);
      } finally {
        if (!cancelled) setReportingLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const dirty = useMemo(() => {
    if (!perms || !savedPerms) return false;
    return PERMISSION_KEYS.some((k) => (perms[k] === true) !== (savedPerms[k] === true));
  }, [perms, savedPerms]);

  const grantedCount = perms ? PERMISSION_KEYS.filter((k) => perms[k] === true).length : 0;

  async function savePermissions() {
    if (!id || !perms) return;
    setSavingPerms(true);
    try {
      const res = await apiFetch('/api/employee-permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, permissions: perms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setPerms(data.permissions);
      setSavedPerms(data.permissions);
      setPermsConfigured(true);
      notify.success('Permissions updated.');
    } catch (e) {
      notify.error(
        `Could not save permissions: ${e instanceof Error ? e.message : 'unknown error'}`,
      );
    } finally {
      setSavingPerms(false);
    }
  }

  // Grant/revoke this staff member's access to their own dept/faculty stress results.
  async function toggleStressAccess(
    field: 'view_department_stress' | 'view_faculty_stress',
    value: boolean,
  ) {
    onUserChange({ [field]: value }); // optimistic
    try {
      const res = await apiFetch('/api/staff-stress-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user?.id, email: user?.email, [field]: value }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Request failed (${res.status})`);
      }
    } catch (e) {
      onUserChange({ [field]: !value }); // revert
      notify.error(
        `Could not update stress-results access: ${e instanceof Error ? e.message : 'unknown error'}`,
      );
    }
  }

  if (loading || !user) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardBody className="flex flex-col sm:flex-row gap-6">
            <Skeleton className="h-32 w-32 rounded-xl shrink-0" />
            <div className="flex-1 grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-col gap-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-full" />
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Identity */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-strong">Employee details</h2>
        </CardHeader>
        <CardBody className="flex flex-col sm:flex-row gap-6">
          <div className="shrink-0">
            {user.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={`/${user.image}`}
                alt=""
                width={128}
                height={128}
                className="h-32 w-32 rounded-xl object-cover border border-line bg-canvas"
              />
            ) : (
              <div className="h-32 w-32 rounded-xl border border-line bg-pes-50 grid place-items-center text-2xl font-semibold text-pes-700">
                {user.name?.trim().charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>

          <dl className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <Detail label="Name" value={user.name} />
            <Detail label="Email" value={user.email} />
            <Detail label="Functional GSM" value={user.gsm} />
            <Detail label="Present role" value={user.role} />
            <Detail label="Faculty / college" value={user.faculty_college} />
            <Detail label="Home address" value={user.address} />

            {expanded && (
              <>
                <Detail label="Date of birth" value={asDate(user.dob)} />
                <Detail label="Date of first appointment" value={asDate(user.doa)} />
                <Detail label="Post / grade of first appointment" value={user.poa} />
                <Detail label="Date of confirmation" value={asDate(user.doc)} />
                <Detail label="Present post" value={user.post} />
                <Detail label="Date appointed to present post" value={asDate(user.dopp)} />
                <Detail label="Current level / step" value={user.level} />
              </>
            )}
          </dl>
        </CardBody>
        <div className="px-5 pb-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Show less' : 'Show appointment history'}
          </Button>
        </div>
      </Card>

      {/* Stress results read-access the admin grants this staff member */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-strong">Stress results access</h2>
          <p className="text-sm text-muted mt-1">
            Allow this employee to view their own department and faculty stress results.
          </p>
        </CardHeader>
        <CardBody className="flex flex-col divide-y divide-line py-0">
          {(
            [
              {
                field: 'view_department_stress',
                label: 'Department stress results',
                hint: 'Sees the approved stress outcome for their own department.',
              },
              {
                field: 'view_faculty_stress',
                label: 'Faculty / division stress results',
                hint: 'Sees the approved stress outcome for their faculty or division.',
              },
            ] as const
          ).map((row) => (
            <div key={row.field} className="flex items-center justify-between gap-6 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-strong">{row.label}</p>
                <p className="text-sm text-muted mt-0.5">{row.hint}</p>
              </div>
              <Switch
                checked={!!user[row.field]}
                onCheckedChange={(checked) => toggleStressAccess(row.field, checked === true)}
                aria-label={row.label}
              />
            </div>
          ))}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Reporting hierarchy — read from the HOD assignments */}
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-strong">
              <GitBranch size={16} className="text-muted" />
              Reporting hierarchy
            </h2>
            <p className="text-sm text-muted mt-1">
              Who this employee reports to, based on their department assignment.
            </p>
          </CardHeader>
          <CardBody>
            {!reportingLoaded ? (
              <Skeleton className="h-10 w-full" />
            ) : reporting ? (
              <div className="flex items-center gap-3 rounded-lg border border-line bg-canvas px-4 py-3">
                <div className="h-9 w-9 rounded-full bg-pes-100 text-pes-700 grid place-items-center text-sm font-semibold shrink-0">
                  {reporting.name?.trim().charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-strong truncate">{reporting.name}</p>
                  <p className="text-xs text-muted truncate">
                    {[reporting.role, reporting.dept].filter(Boolean).join(' · ') || 'Department lead'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-line px-4 py-5 text-center">
                <p className="text-sm text-body">No reporting line set</p>
                <p className="text-sm text-muted mt-1">
                  This employee has not been assigned to a department lead yet. Assign one from
                  the department’s HOD assignment to populate this.
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Live capability grants */}
        <Card>
          <CardHeader className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-strong">
                <ShieldCheck size={16} className="text-muted" />
                Permission settings
              </h2>
              <p className="text-sm text-muted mt-1">
                What this employee can do in PES, independent of their role name.
              </p>
            </div>
            {perms && (
              <Badge tone={grantedCount ? 'brand' : 'neutral'}>
                {grantedCount} of {PERMISSION_KEYS.length} granted
              </Badge>
            )}
          </CardHeader>

          {permsError ? (
            <CardBody>
              <Alert tone="danger" title="Permissions could not be loaded">
                {permsError}
              </Alert>
            </CardBody>
          ) : !perms ? (
            <CardBody className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardBody>
          ) : (
            <>
              {!permsConfigured && (
                <div className="px-5 pt-4">
                  <Alert tone="warning" title="No permissions recorded">
                    This employee predates per-employee permissions. Nothing is granted until you
                    save a selection below.
                  </Alert>
                </div>
              )}

              <div className={canEditPerms ? '' : 'opacity-70 pointer-events-none'}>
                <PermissionSelector
                  value={perms}
                  onChange={(patch) => setPerms((prev) => ({ ...prev, ...patch }))}
                />
              </div>

              <div className="px-5 py-4 border-t border-line flex flex-wrap items-center justify-end gap-3">
                {!canEditPerms ? (
                  <p className="text-sm text-muted mr-auto">
                    Read-only — editing permissions requires the “Manage user roles” capability.
                  </p>
                ) : (
                  <p className="text-sm text-muted mr-auto">
                    Editing this employee’s role template later will overwrite these grants.
                  </p>
                )}
                {canEditPerms && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={!dirty || savingPerms}
                      onClick={() => setPerms(savedPerms)}
                    >
                      Reset
                    </Button>
                    <Button size="sm" loading={savingPerms} disabled={!dirty} onClick={savePermissions}>
                      Save permissions
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
