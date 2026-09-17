'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Input, PageHeader } from '@/app/components/ui';
import { Alert } from '@/app/components/ui/alert';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/select';
import { PRESET_ROLES } from '@/app/components/utils/roles';

type OrgCategory = 'company' | 'public' | 'academic';

type EmployeeRow = {
  key: number;
  name: string;
  email: string;
  password: string;
  dept: string;
  role: string;
  level: string;
};

type SeedResult = {
  org: string;
  adminEmail: string;
  employeesCreated: number;
  employeeErrors: { email: string; message: string }[];
  credentialsText: string;
};

const CATEGORY_OPTIONS: { value: OrgCategory; label: string }[] = [
  { value: 'company', label: 'Company' },
  { value: 'public', label: 'Public service' },
  { value: 'academic', label: 'Academic' },
];

const PLAN_OPTIONS = [
  { value: 'basic', label: 'Basic' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
];

function emptyEmployee(key: number): EmployeeRow {
  return { key, name: '', email: '', password: '', dept: '', role: 'employee-w', level: '' };
}

function roleLabel(role: string) {
  return role
    .split('-')
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');
}

export default function LocalSeedPage() {
  const [status, setStatus] = useState<'loading' | 'blocked' | 'seeded' | 'ready'>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [savedCredentials, setSavedCredentials] = useState<string | null>(null);
  const [nextKey, setNextKey] = useState(0);

  const [orgName, setOrgName] = useState('');
  const [category, setCategory] = useState<OrgCategory>('company');
  const [plan, setPlan] = useState('premium');

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);

  useEffect(() => {
    fetch('/api/local-seed')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data.seeded) {
          setSavedCredentials(data.credentialsText ?? null);
          setStatus('seeded');
        } else {
          setStatus('ready');
        }
      })
      .catch(() => setStatus('blocked'));
  }, []);

  const availableRoles = PRESET_ROLES.filter((r) => r !== 'lecturer' || category === 'academic');

  function updateEmployee(key: number, patch: Partial<EmployeeRow>) {
    setEmployees((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addEmployee() {
    setEmployees((rows) => [...rows, emptyEmployee(nextKey)]);
    setNextKey((k) => k + 1);
  }

  function removeEmployee(key: number) {
    setEmployees((rows) => rows.filter((r) => r.key !== key));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/local-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org: { name: orgName, category, plan },
          admin: { name: adminName, email: adminEmail, password: adminPassword },
          employees: employees
            .filter((r) => r.name || r.email || r.password)
            .map(({ key, ...rest }) => rest),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Seeding failed.');
        return;
      }
      setResult(data);
      setStatus('seeded');
    } catch {
      setError('Could not reach the server. Is the app running?');
    } finally {
      setSubmitting(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-sm text-muted">Checking database status…</p>
      </div>
    );
  }

  if (status === 'blocked') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <PageHeader title="Local seed" />
        <Alert tone="danger" title="Not available">
          This page only works against a local database with <code>NODE_ENV</code> other than
          <code> production</code>. It refuses to run against a deployed environment.
        </Alert>
      </div>
    );
  }

  if (status === 'seeded') {
    const credentialsText = result?.credentialsText ?? savedCredentials;

    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <PageHeader title="Local seed" subtitle="This database already has an organization." />
        <Card className="p-6 flex flex-col gap-4">
          {result ? (
            <>
              <Alert tone="success" title={`"${result.org}" is ready`}>
                Admin account: <strong>{result.adminEmail}</strong>. {result.employeesCreated} employee
                {result.employeesCreated === 1 ? '' : 's'} created.
              </Alert>
              {result.employeeErrors.length > 0 && (
                <Alert tone="warning" title="Some employees were skipped">
                  <ul className="list-disc pl-5">
                    {result.employeeErrors.map((e) => (
                      <li key={e.email}>
                        {e.email}: {e.message}
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}
            </>
          ) : (
            <p className="text-sm text-body">
              Seeding only ever runs once. These are the details from when it ran.
            </p>
          )}

          {credentialsText ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted">
                Also saved to <code>LOCAL_SEED_CREDENTIALS.md</code> in the project root.
              </p>
              <pre className="text-xs bg-canvas border border-line rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
                {credentialsText}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted">
              No saved credentials file was found — this org may have been seeded another way.
            </p>
          )}

          <Button href="/" variant="primary" className="w-fit">
            Go to sign in
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <PageHeader
        title="Seed your local database"
        subtitle="Runs once — create the organization and its admin. Employees are optional; the admin can add them from within the app instead."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && <Alert tone="danger" title="Could not seed">{error}</Alert>}

        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-strong">Organization</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Name"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              containerClassName="sm:col-span-1"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-body">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as OrgCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-body">Plan</label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLAN_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-strong">Admin account</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Full name" required value={adminName} onChange={(e) => setAdminName(e.target.value)} />
            <Input
              label="Email"
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="text"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              hint="Stored hashed — shown in plain text only here and in the saved credentials file."
            />
          </div>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-strong">Employees</h2>
              <p className="text-xs text-muted mt-0.5">
                Optional — skip this and add employees later as the admin, from within the app.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addEmployee}>
              Add employee
            </Button>
          </div>

          {employees.length > 0 && (
            <div className="flex flex-col gap-4">
              {employees.map((row, i) => (
                <div key={row.key} className="border border-line rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted">Employee {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEmployee(row.key)}
                      className="text-xs text-danger-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Input
                      label="Full name"
                      value={row.name}
                      onChange={(e) => updateEmployee(row.key, { name: e.target.value })}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={row.email}
                      onChange={(e) => updateEmployee(row.key, { email: e.target.value })}
                    />
                    <Input
                      label="Password"
                      value={row.password}
                      onChange={(e) => updateEmployee(row.key, { password: e.target.value })}
                    />
                    <Input
                      label="Department"
                      value={row.dept}
                      onChange={(e) => updateEmployee(row.key, { dept: e.target.value })}
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-body">Role</label>
                      <Select value={row.role} onValueChange={(v) => updateEmployee(row.key, { role: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((r) => (
                            <SelectItem key={r} value={r}>{roleLabel(r)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      label="Level"
                      value={row.level}
                      onChange={(e) => updateEmployee(row.key, { level: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={submitting} disabled={submitting}>
            Seed database
          </Button>
          <Link href="/" className="text-sm text-muted hover:underline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
