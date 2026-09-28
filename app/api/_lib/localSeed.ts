/** Local-dev-only seeding: an organization, its admin, and a flat employee
 *  list, entered through the /local-seed UI instead of hand-edited JSON. Can
 *  be called repeatedly to build up several organizations — one per
 *  institution type or otherwise — in the same local database.
 *
 *  Shares the same building blocks the rest of the app uses to create these
 *  rows — `seedPresetRoles` and `createEmployee` — so a seeded org looks
 *  exactly like one a real signup + admin would have produced, and never
 *  drifts from what `resolveRoleName` / the single-head check actually
 *  enforce.
 *
 *  Callers (the API route) are responsible for refusing to run this outside
 *  local development — this module only enforces the data-safety half:
 *  refuse whenever an org with the same name already exists. It also appends
 *  the plaintext passwords to LOCAL_SEED_CREDENTIALS.json/.md — the only
 *  place they're ever shown in full — so the caller must only ever run with
 *  that guard in place. */
import prisma from '../prisma.dev';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { seedPresetRoles } from './seedRoles';
import { createEmployee, resolveRoleName, type EmployeeInput } from './createEmployee';
import { PRESET_ROLES, resolveBaseRole, presetPermissionMap } from '@/app/components/utils/roles';
import { roleAllowedForCategory } from './createEmployee';

export type LocalSeedEmployee = {
  name: string;
  email: string;
  password: string;
  dept?: string;
  role?: string;
  /** Which system preset a custom `role` behaves as (permissions, single-head
   *  rules). Ignored for a preset `role`. Defaults to 'employee-w'. */
  baseRole?: string;
  level?: string;
};

/** `role` on a seed employee can name a role that doesn't exist in this org yet
 *  — unlike the rest of the app, where roles are created ahead of time through
 *  the Roles UI (see `app/api/addRoles/route.ts`, which this mirrors). Creates
 *  it as a custom role with `baseRole`'s permission template (default
 *  'employee-w') so seeding from a file doesn't require a UI round-trip first. */
async function ensureCustomRole(
  orgId: string,
  role: string,
  baseRole: string | undefined,
  category: string,
): Promise<void> {
  const trimmed = role.trim();
  if (!trimmed || (PRESET_ROLES as readonly string[]).includes(trimmed)) return;

  const existing = await prisma.roles.findFirst({
    where: { org_id: orgId, name: { equals: trimmed, mode: 'insensitive' } },
    select: { id: true },
  });
  if (existing) return;

  // A baseRole not allowed for this org's category (e.g. 'lecturer' outside
  // academic) would otherwise make every employee holding this custom role
  // behave as that preset — fall back to the universal baseline instead.
  const requestedBaseRole = resolveBaseRole(baseRole);
  const resolvedBaseRole = roleAllowedForCategory(requestedBaseRole, category)
    ? requestedBaseRole
    : resolveBaseRole(undefined);

  await prisma.roles.create({
    data: { name: trimmed, org_id: orgId, base_role: resolvedBaseRole, assigned: 0 },
  });

  const templateUserId = `role:${orgId}:${trimmed}`;
  const existingTemplate = await prisma.permission.findFirst({ where: { user_id: templateUserId } });
  if (!existingTemplate) {
    await prisma.permission.create({
      data: { ...presetPermissionMap(resolvedBaseRole), user_id: templateUserId, org_id: orgId },
    });
  }
}

export type LocalSeedInput = {
  org: { name: string; category: 'company' | 'public' | 'academic'; plan: string };
  admin: { name: string; email: string; password: string };
  employees: LocalSeedEmployee[];
};

export type LocalSeedResult =
  | {
      ok: true;
      org: string;
      category: string;
      adminEmail: string;
      employeesCreated: number;
      employeeErrors: { email: string; message: string }[];
      credentialsText: string;
    }
  | { ok: false; reason: 'already_seeded' | 'invalid_input'; message: string };

/** One org's worth of plaintext credentials, as persisted in the JSON store. */
export type SeedRecord = {
  org: string;
  category: string;
  plan: string;
  seededAt: string;
  admin: { name: string; email: string; password: string };
  employees: LocalSeedEmployee[];
};

export const CREDENTIALS_JSON_FILE = path.join(process.cwd(), 'LOCAL_SEED_CREDENTIALS.json');
export const CREDENTIALS_FILE = path.join(process.cwd(), 'LOCAL_SEED_CREDENTIALS.md');

/** Whether any org has been seeded — used only to gate the /local-seed page's
 *  "outside local dev" message, never to refuse seeding itself (that's
 *  per-org-name, see `isOrgSeeded`). */
export async function isLocalSeeded(): Promise<boolean> {
  return (await prisma.org.count()) > 0;
}

/** Whether an org with this exact name (case-insensitive) already exists —
 *  the actual seeding guard, so multiple organizations can be seeded one
 *  after another into the same database. */
export async function isOrgSeeded(name: string): Promise<boolean> {
  const existing = await prisma.org.findFirst({
    where: { name: { equals: name.trim(), mode: 'insensitive' } },
    select: { id: true },
  });
  return existing != null;
}

function readCredentialsStore(): SeedRecord[] {
  try {
    const raw = fs.readFileSync(CREDENTIALS_JSON_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** All orgs seeded so far, most recent first — what the /local-seed page
 *  lists and filters by institution type. */
export function listSeededOrgs(): SeedRecord[] {
  return [...readCredentialsStore()].reverse();
}

/** The full credentials document across every seeded org — read back so the
 *  /local-seed page can show the same details after a reload. Returns null if
 *  nothing has been seeded through this path yet. */
export function readCredentialsFile(): string | null {
  try {
    return fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
  } catch {
    return null;
  }
}

function buildCredentialsDoc(records: SeedRecord[]): string {
  const lines: string[] = [];
  lines.push('# Local seed credentials');
  lines.push('');
  lines.push(
    'Plaintext passwords — this file is gitignored and only ever lives on your' +
      ' machine. Delete it once you\'ve saved these somewhere safer, or run' +
      ' `npm run db:reset` to wipe the database and this file together.',
  );
  lines.push('');

  for (const record of records) {
    lines.push(`## ${record.org} (${record.category})`);
    lines.push('');
    lines.push(`Seeded ${record.seededAt}. Plan: ${record.plan}.`);
    lines.push('');
    lines.push('### Admin');
    lines.push('');
    lines.push(`- Full name: ${record.admin.name}`);
    lines.push(`- Email: ${record.admin.email}`);
    lines.push(`- Password: ${record.admin.password}`);
    lines.push('');
    lines.push('### Employees');
    lines.push('');
    if (record.employees.length === 0) {
      lines.push('None seeded — add employees from within the app once signed in as admin.');
    } else {
      lines.push('| Full name | Email | Password | Department | Role | Level |');
      lines.push('| --- | --- | --- | --- | --- | --- |');
      for (const emp of record.employees) {
        lines.push(
          `| ${emp.name} | ${emp.email} | ${emp.password} | ${emp.dept || '—'} | ${emp.role || '—'} | ${emp.level || '—'} |`,
        );
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

function appendCredentials(record: SeedRecord): string {
  const records = [...readCredentialsStore(), record];
  fs.writeFileSync(CREDENTIALS_JSON_FILE, JSON.stringify(records, null, 2), 'utf-8');
  const doc = buildCredentialsDoc(records);
  fs.writeFileSync(CREDENTIALS_FILE, doc, 'utf-8');
  return doc;
}

export async function seedLocalOrg(input: LocalSeedInput): Promise<LocalSeedResult> {
  if (!input.org.name.trim() || !input.admin.email.trim() || !input.admin.password.trim()) {
    return { ok: false, reason: 'invalid_input', message: 'Organization name and admin email/password are required.' };
  }

  if (await isOrgSeeded(input.org.name)) {
    return {
      ok: false,
      reason: 'already_seeded',
      message: `An organization named "${input.org.name.trim()}" already exists.`,
    };
  }

  // A seeded org is for local development, not a real purchase — default to
  // the top tier rather than starting every test org on the cheapest plan.
  const plan = input.org.plan.trim() || 'premium';

  const org = await prisma.org.create({
    data: {
      name: input.org.name.trim(),
      category: input.org.category,
      plan,
      maintenance_model: false,
      evaluation: [],
    },
  });

  await prisma.pesuser.create({
    data: {
      name: input.admin.name.trim(),
      email: input.admin.email.trim(),
      password: await bcrypt.hash(input.admin.password, 10),
      role: 'admin',
      org_id: org.id,
      category: input.org.category,
      plan,
    },
  });

  // org.plan is a display field; the pricing page's "Current Plan" badge
  // actually reads subscriptions_info (see /api/subscriptions/active), the
  // same table a real Paystack/PayPal payment writes to. Without a matching
  // row here, a seeded org's plan would show on the org record but never
  // highlight on the pricing page — write one so seeding produces the same
  // state a real subscription would.
  await prisma.subscriptions_info.create({
    data: {
      pesuser_email: input.admin.email.trim(),
      pesuser_name: input.admin.name.trim(),
      org_id: org.id,
      plan_code: 'local-seed',
      plan_name: plan.toLowerCase(),
      reference: `local-seed-${org.id}`,
      status: 'success',
      paid_at: new Date(),
      expires_at: null,
    },
  });

  await seedPresetRoles(org.id, input.org.category);

  // The admin was created directly above, not through createEmployee (the
  // only place that increments a role's `assigned` counter) — without this,
  // the Roles & Permissions table shows 0 users against Admin even though the
  // org's own admin holds it.
  await prisma.roles.updateMany({
    where: { org_id: org.id, name: 'admin' },
    data: { assigned: { increment: 1 } },
  });

  const employeeErrors: { email: string; message: string }[] = [];
  const createdEmployees: LocalSeedEmployee[] = [];

  for (const emp of input.employees) {
    if (!emp.name.trim() || !emp.email.trim() || !emp.password.trim()) {
      employeeErrors.push({ email: emp.email || '(blank)', message: 'Name, email and password are required.' });
      continue;
    }

    const requestedRole = emp.role?.trim() || 'employee-w';
    await ensureCustomRole(org.id, requestedRole, emp.baseRole, input.org.category);
    const canonicalRole = await resolveRoleName(org.name, requestedRole, input.org.category, org.id);
    if (!canonicalRole) {
      employeeErrors.push({ email: emp.email, message: `Role "${requestedRole}" does not exist in this organization.` });
      continue;
    }

    const employeeInput: EmployeeInput = {
      name: emp.name.trim(),
      email: emp.email.trim(),
      gsm: '',
      role: canonicalRole,
      address: '',
      dept: emp.dept?.trim() || '',
      faculty_college: '',
      dob: '',
      doa: '',
      level: emp.level?.trim() || null,
      org: org.name,
      orgId: org.id,
    };

    const result = await createEmployee(employeeInput, emp.password);
    if (result.ok) {
      createdEmployees.push(emp);
    } else {
      employeeErrors.push({ email: emp.email, message: result.message });
    }
  }

  const credentialsText = appendCredentials({
    org: org.name,
    category: input.org.category,
    plan,
    seededAt: new Date().toISOString(),
    admin: { name: input.admin.name.trim(), email: input.admin.email.trim(), password: input.admin.password },
    employees: createdEmployees,
  });

  return {
    ok: true,
    org: org.name,
    category: input.org.category,
    adminEmail: input.admin.email,
    employeesCreated: createdEmployees.length,
    employeeErrors,
    credentialsText,
  };
}
