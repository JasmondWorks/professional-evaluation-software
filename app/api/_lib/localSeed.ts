/** Local-dev-only seeding: one organization, its admin, and a flat employee
 *  list, entered through the /local-seed UI instead of hand-edited JSON.
 *
 *  Shares the same building blocks the rest of the app uses to create these
 *  rows — `seedPresetRoles` and `createEmployee` — so a seeded org looks
 *  exactly like one a real signup + admin would have produced, and never
 *  drifts from what `resolveRoleName` / the single-head check actually
 *  enforce.
 *
 *  Callers (the API route) are responsible for refusing to run this outside
 *  local development — this module only enforces the data-safety half:
 *  refuse whenever an org already exists. It also writes the plaintext
 *  passwords to LOCAL_SEED_CREDENTIALS.md — the only place they're ever
 *  shown in full — so the caller must only ever run with that guard in
 *  place. */
import prisma from '../prisma.dev';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { seedPresetRoles } from './seedRoles';
import { createEmployee, resolveRoleName, type EmployeeInput } from './createEmployee';

export type LocalSeedEmployee = {
  name: string;
  email: string;
  password: string;
  dept?: string;
  role?: string;
  level?: string;
};

export type LocalSeedInput = {
  org: { name: string; category: 'company' | 'public' | 'academic'; plan: string };
  admin: { name: string; email: string; password: string };
  employees: LocalSeedEmployee[];
};

export type LocalSeedResult =
  | {
      ok: true;
      org: string;
      adminEmail: string;
      employeesCreated: number;
      employeeErrors: { email: string; message: string }[];
      credentialsText: string;
    }
  | { ok: false; reason: 'already_seeded' | 'invalid_input'; message: string };

export const CREDENTIALS_FILE = path.join(process.cwd(), 'LOCAL_SEED_CREDENTIALS.md');

export async function isLocalSeeded(): Promise<boolean> {
  return (await prisma.org.count()) > 0;
}

/** The saved credentials document, if one was ever written — read back so the
 *  /local-seed page can show the same details after a reload instead of just
 *  saying "already seeded". Returns null if seeding happened some other way
 *  (or the file was deleted), which the page treats as an unremarkable case. */
export function readCredentialsFile(): string | null {
  try {
    return fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
  } catch {
    return null;
  }
}

function buildCredentialsDoc(input: LocalSeedInput, createdEmployees: LocalSeedEmployee[]): string {
  const lines: string[] = [];
  lines.push('# Local seed credentials');
  lines.push('');
  lines.push(
    `Generated ${new Date().toISOString()} by the /local-seed form. Plaintext passwords —` +
      ' this file is gitignored and only ever lives on your machine. Delete it once you\'ve' +
      ' saved these somewhere safer, or run `npm run db:reset` to wipe the database and this' +
      ' file together.',
  );
  lines.push('');
  lines.push('## Organization');
  lines.push('');
  lines.push(`- Name: ${input.org.name}`);
  lines.push(`- Category: ${input.org.category}`);
  lines.push(`- Plan: ${input.org.plan}`);
  lines.push('');
  lines.push('## Admin');
  lines.push('');
  lines.push(`- Full name: ${input.admin.name}`);
  lines.push(`- Email: ${input.admin.email}`);
  lines.push(`- Password: ${input.admin.password}`);
  lines.push('');
  lines.push('## Employees');
  lines.push('');
  if (createdEmployees.length === 0) {
    lines.push('None seeded — add employees from within the app once signed in as admin.');
  } else {
    lines.push('| Full name | Email | Password | Department | Role | Level |');
    lines.push('| --- | --- | --- | --- | --- | --- |');
    for (const emp of createdEmployees) {
      lines.push(
        `| ${emp.name} | ${emp.email} | ${emp.password} | ${emp.dept || '—'} | ${emp.role || '—'} | ${emp.level || '—'} |`,
      );
    }
  }
  lines.push('');
  return lines.join('\n');
}

export async function seedLocalOrg(input: LocalSeedInput): Promise<LocalSeedResult> {
  if (await isLocalSeeded()) {
    return {
      ok: false,
      reason: 'already_seeded',
      message: 'An organization already exists — seeding only ever runs once.',
    };
  }

  if (!input.org.name.trim() || !input.admin.email.trim() || !input.admin.password.trim()) {
    return { ok: false, reason: 'invalid_input', message: 'Organization name and admin email/password are required.' };
  }

  const org = await prisma.org.create({
    data: {
      name: input.org.name.trim(),
      category: input.org.category,
      plan: input.org.plan,
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
      plan: input.org.plan,
    },
  });

  await seedPresetRoles(org.id, input.org.category);

  const employeeErrors: { email: string; message: string }[] = [];
  const createdEmployees: LocalSeedEmployee[] = [];

  for (const emp of input.employees) {
    if (!emp.name.trim() || !emp.email.trim() || !emp.password.trim()) {
      employeeErrors.push({ email: emp.email || '(blank)', message: 'Name, email and password are required.' });
      continue;
    }

    const requestedRole = emp.role?.trim() || 'employee-w';
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

  const credentialsText = buildCredentialsDoc(input, createdEmployees);
  fs.writeFileSync(CREDENTIALS_FILE, credentialsText, 'utf-8');

  return {
    ok: true,
    org: org.name,
    adminEmail: input.admin.email,
    employeesCreated: createdEmployees.length,
    employeeErrors,
    credentialsText,
  };
}
