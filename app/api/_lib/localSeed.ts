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
 *  refuse whenever an org already exists. */
import prisma from '../prisma.dev';
import bcrypt from 'bcryptjs';
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
    }
  | { ok: false; reason: 'already_seeded' | 'invalid_input'; message: string };

export async function isLocalSeeded(): Promise<boolean> {
  return (await prisma.org.count()) > 0;
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
  let employeesCreated = 0;

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
      employeesCreated += 1;
    } else {
      employeeErrors.push({ email: emp.email, message: result.message });
    }
  }

  return {
    ok: true,
    org: org.name,
    adminEmail: input.admin.email,
    employeesCreated,
    employeeErrors,
  };
}
