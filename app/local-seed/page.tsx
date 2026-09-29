"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, Input, PageHeader } from "@/app/components/ui";
import { Alert } from "@/app/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";
import { PRESET_ROLE_LABELS } from "@/app/components/utils/roles";

type OrgCategory = "company" | "public" | "academic";

type EmployeeRow = {
  key: number;
  name: string;
  email: string;
  password: string;
  level: string;
};

type SeedRecord = {
  org: string;
  category: string;
  plan: string;
  seededAt: string;
  admin: { name: string; email: string; password: string };
  employees: { name: string; email: string; password: string; dept?: string; role?: string; level?: string }[];
};

type SeedResult = {
  org: string;
  category: string;
  adminEmail: string;
  employeesCreated: number;
  employeeErrors: { email: string; message: string }[];
};

const CATEGORY_OPTIONS: { value: OrgCategory; label: string }[] = [
  { value: "company", label: "Company" },
  { value: "public", label: "Public service" },
  { value: "academic", label: "Academic" },
];

const CATEGORY_LABELS: Record<string, string> = {
  company: "Company",
  public: "Public service",
  academic: "Academic",
};

const PLAN_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
];

function emptyEmployee(key: number): EmployeeRow {
  return {
    key,
    name: "",
    email: "",
    password: "",
    level: "",
  };
}

function roleLabel(role: string) {
  return (
    PRESET_ROLE_LABELS[role as keyof typeof PRESET_ROLE_LABELS] ??
    role
      .split("-")
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(" ")
  );
}

export default function LocalSeedPage() {
  const [status, setStatus] = useState<"loading" | "blocked" | "ready">(
    "loading",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [orgs, setOrgs] = useState<SeedRecord[]>([]);
  const [filter, setFilter] = useState<OrgCategory | "all">("all");
  const [nextKey, setNextKey] = useState(0);

  const [orgName, setOrgName] = useState("");
  const [category, setCategory] = useState<OrgCategory>("company");
  const [plan, setPlan] = useState("premium");

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);

  function loadOrgs() {
    return fetch("/api/local-seed")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        setOrgs(Array.isArray(data.orgs) ? data.orgs : []);
        setStatus("ready");
      })
      .catch(() => setStatus("blocked"));
  }

  useEffect(() => {
    loadOrgs();
  }, []);

  const visibleOrgs =
    filter === "all" ? orgs : orgs.filter((o) => o.category === filter);

  function resetForm() {
    setOrgName("");
    setPlan("premium");
    setAdminName("");
    setAdminEmail("");
    setAdminPassword("");
    setEmployees([]);
  }

  function updateEmployee(key: number, patch: Partial<EmployeeRow>) {
    setEmployees((rows) =>
      rows.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
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
    setResult(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/local-seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org: { name: orgName, category, plan },
          admin: {
            name: adminName,
            email: adminEmail,
            password: adminPassword,
          },
          employees: employees
            .filter((r) => r.name || r.email || r.password)
            .map(({ key, ...rest }) => rest),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Seeding failed.");
        return;
      }
      setResult(data);
      resetForm();
      await loadOrgs();
    } catch {
      setError("Could not reach the server. Is the app running?");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-sm text-muted">Checking database status…</p>
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <PageHeader title="Local seed" />
        <Alert tone="danger" title="Not available">
          This page is disabled. Set <code>LOCAL_SEED_ENABLED=true</code> in
          this environment's variables to enable it.
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-10">
      <div>
        <PageHeader
          title="Seed your local database"
          subtitle="Add organizations one at a time — academic, company, public, however many you need. Employees are optional; the admin can add them from within the app instead."
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <Alert tone="danger" title="Could not seed">
              {error}
            </Alert>
          )}

          {result && (
            <>
              <Alert tone="success" title={`"${result.org}" is ready`}>
                Admin account: <strong>{result.adminEmail}</strong>.{" "}
                {result.employeesCreated} employee
                {result.employeesCreated === 1 ? "" : "s"} created. Add
                another organization below, or{" "}
                <Link href="/" className="underline">
                  go to sign in
                </Link>
                .
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
          )}

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
                <label className="text-sm font-medium text-body">
                  Category
                </label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as OrgCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-body">Plan</label>
                <Select value={plan} onValueChange={setPlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-strong">
              Admin account
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Full name"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
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
                <h2 className="text-sm font-semibold text-strong">
                  Employees
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Optional — seeded as regular (baseline) employees. The
                  organization admin assigns departments and roles from
                  within the app.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEmployee}
              >
                Add employee
              </Button>
            </div>

            {employees.length > 0 && (
              <div className="flex flex-col gap-4">
                {employees.map((row, i) => (
                  <div
                    key={row.key}
                    className="border border-line rounded-lg p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted">
                        Employee {i + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmployee(row.key)}
                        className="text-xs text-danger-600 hover:underline h-auto px-0"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <Input
                        label="Full name"
                        value={row.name}
                        onChange={(e) =>
                          updateEmployee(row.key, { name: e.target.value })
                        }
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={row.email}
                        onChange={(e) =>
                          updateEmployee(row.key, { email: e.target.value })
                        }
                      />
                      <Input
                        label="Password"
                        value={row.password}
                        onChange={(e) =>
                          updateEmployee(row.key, { password: e.target.value })
                        }
                      />
                      <Input
                        label="Level"
                        value={row.level}
                        onChange={(e) =>
                          updateEmployee(row.key, { level: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex items-center gap-3">
            <Button type="submit" loading={submitting} disabled={submitting}>
              Seed organization
            </Button>
            <Link href="/" className="text-sm text-muted hover:underline">
              Go to sign in
            </Link>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-strong">
            Seeded organizations ({orgs.length})
          </h2>
          <div className="flex items-center gap-1.5">
            {(["all", "academic", "company", "public"] as const).map((f) => (
              <Button
                key={f}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFilter(f)}
                className={`rounded-full border h-auto px-3 py-1.5 ${
                  filter === f
                    ? "bg-strong text-white border-strong hover:bg-strong"
                    : "border-line text-muted hover:text-body"
                }`}
              >
                {f === "all" ? "All" : CATEGORY_LABELS[f]}
              </Button>
            ))}
          </div>
        </div>

        {visibleOrgs.length === 0 ? (
          <p className="text-sm text-muted">
            {orgs.length === 0
              ? "Nothing seeded yet — use the form above."
              : "No organizations of this type yet."}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {visibleOrgs.map((record) => (
              <Card key={record.org} className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-strong">
                      {record.org}
                    </h3>
                    <p className="text-xs text-muted">
                      {CATEGORY_LABELS[record.category] ?? record.category} ·{" "}
                      {record.plan} · seeded{" "}
                      {new Date(record.seededAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-body">
                  <span className="font-medium">Admin:</span>{" "}
                  {record.admin.name} — {record.admin.email} /{" "}
                  <code>{record.admin.password}</code>
                </div>
                {record.employees.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-muted">
                          <th className="pr-4 py-1 font-medium">Name</th>
                          <th className="pr-4 py-1 font-medium">Email</th>
                          <th className="pr-4 py-1 font-medium">Password</th>
                          <th className="pr-4 py-1 font-medium">Dept</th>
                          <th className="pr-4 py-1 font-medium">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.employees.map((emp) => (
                          <tr key={emp.email} className="border-t border-line">
                            <td className="pr-4 py-1">{emp.name}</td>
                            <td className="pr-4 py-1">{emp.email}</td>
                            <td className="pr-4 py-1">
                              <code>{emp.password}</code>
                            </td>
                            <td className="pr-4 py-1">{emp.dept || "—"}</td>
                            <td className="pr-4 py-1">
                              {emp.role ? roleLabel(emp.role) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {orgs.length > 0 && (
          <p className="text-xs text-muted">
            Also saved to the <code>seed_credential</code> table — visible here again on reload.
          </p>
        )}
      </div>
    </div>
  );
}
