/** Creating one employee: the single path used by both /api/addEmployee and the
 *  bulk upload.
 *
 *  This lived inline in the single-employee route. Bulk upload needs exactly the
 *  same work — role resolution, the single-head check, the permission row, the
 *  assigned counter, the credentials email — and duplicating it is how the two
 *  drift until only one of them enforces something. */
import prisma from '../prisma.dev';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendMail } from '@/app/lib/email';
import { PRESET_ROLES, resolveBaseRole, PermissionKey } from '@/app/components/utils/roles';
import { checkSingleHead } from './singleHead';

const randombytes = require('randombytes');

export const PERMISSION_FIELDS: PermissionKey[] = [
  'can_manage_user_roles',
  'can_access_employee_data',
  'access_employee_all',
  'access_employee_subordinates',
  'access_employee_selected',
  'can_define_performance_metrics',
  'define_performance_all',
  'define_performance_subordinates',
  'define_performance_selected',
  'can_access_reporting_hierarchy',
  'can_manage_performance_reviews',
  'manage_reviews_all',
  'manage_reviews_subordinates',
  'manage_reviews_selected',
];

export type EmployeeInput = {
  name: string;
  email: string;
  gsm: string;
  role: string;
  address: string;
  dept: string;
  faculty_college: string;
  dob: string;
  doa: string;
  poa?: string | null;
  doc?: string | null;
  post?: string | null;
  dopp?: string | null;
  level?: string | null;
  org: string;
} & Partial<Record<PermissionKey, boolean>>;

export type CreateOutcome =
  | { ok: true; userId: number; password: string }
  | {
      ok: false;
      reason: 'email_exists' | 'duplicate_employee' | 'head_conflict' | 'unknown_role' | 'error';
      message: string;
    };

/** Strips NUL bytes, which Postgres rejects in text columns. */
function sanitizeString(val?: string | null) {
  if (!val) return null;
  return val.replace(/\u0000/g, '');
}

export function generateUniquePassword(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  const bytes = randombytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(bytes[i] % chars.length));
  }
  return password;
}

/** Does this role exist for the org?
 *
 *  Bulk upload refuses unknown roles rather than inventing them: creating roles
 *  as a side effect of a spreadsheet upload is a surprise nobody asked for, and
 *  a typo would otherwise become a permanent role. */
export async function roleExists(org: string, role: string): Promise<boolean> {
  if ((PRESET_ROLES as readonly string[]).includes(role)) return true;
  const row = await prisma.roles.findFirst({
    where: { name: role, org },
    select: { id: true },
  });
  return Boolean(row);
}

export async function createEmployee(
  input: EmployeeInput,
  password: string,
): Promise<CreateOutcome> {
  const {
    name, email, gsm, role, address, dept, faculty_college,
    dob, doa, poa, doc, post, dopp, level, org,
  } = input;

  try {
    const existing = await prisma.pesuser.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return {
        ok: false,
        reason: 'email_exists',
        message: 'An employee with this email already exists.',
      };
    }

    // A preset selection stays itself; a custom role maps to its base_role so
    // role-based UI stays predictable while the custom name is still displayed.
    let functionalRole: string;
    const displayRole = role;
    if ((PRESET_ROLES as readonly string[]).includes(role)) {
      functionalRole = role;
    } else {
      const roleRow = await prisma.roles.findFirst({
        where: { name: role, org },
        select: { base_role: true },
      });
      functionalRole = resolveBaseRole(roleRow?.base_role);
    }

    // One head per scope: refuse a second HOD for the department, or a second
    // faculty/division head for the faculty, within this org.
    const headCheck = await checkSingleHead(prisma, {
      org,
      role: functionalRole,
      dept,
      faculty_college,
    });
    if (!headCheck.ok) {
      return { ok: false, reason: 'head_conflict', message: headCheck.message };
    }

    const user = await prisma.pesuser.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
        gsm: gsm || null,
        role: functionalRole,
        display_role: displayRole || null,
        address: address || null,
        dept: dept || null,
        faculty_college: faculty_college || null,
        dob: dob ? new Date(dob) : null,
        doa: doa ? new Date(doa) : null,
        poa: sanitizeString(poa),
        doc: sanitizeString(doc),
        post: sanitizeString(post),
        dopp: dopp ? new Date(dopp) : null,
        level: sanitizeString(level),
        image: null,
        org: org || null,
      },
      select: { id: true },
    });

    const permissionData = Object.fromEntries(
      PERMISSION_FIELDS.map((k) => [k, Boolean((input as any)[k])]),
    );

    await prisma.permission.create({
      data: {
        ...permissionData,
        user_id: String(user.id),
        org: org || null,
      } as any,
    });

    await prisma.roles.updateMany({
      where: { name: role, org },
      data: { assigned: { increment: 1 } },
    });

    return { ok: true, userId: user.id, password };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        ok: false,
        reason: 'duplicate_employee',
        message: `${name} is already registered in the ${dept} department.`,
      };
    }
    console.error('createEmployee failed:', error);
    return {
      ok: false,
      reason: 'error',
      message: error instanceof Error ? error.message : 'There was a problem creating this employee.',
    };
  }
}

export async function sendLoginEmail(
  to: string,
  name: string,
  password: string,
  replyTo?: string,
) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #1e3a8a;">Hello ${name},</h2>
      <p>Your account has been created successfully.</p>
      <p><strong>Email:</strong> ${to}</p>
      <p style="margin-bottom: 5px;"><strong>Password:</strong> <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 6px; border: 1px solid #d1d5db; font-family: monospace; font-size: 16px;">${password}</code></p>
      <p style="margin-top: 15px; font-size: 14px; color: #6b7280;"><em>Note: Be careful not to copy any extra spaces before or after the password when pasting.</em></p>
      <p>Please log in and change your password immediately.</p>
    </div>
  `;
  const { success } = await sendMail({ to, subject: 'Your Login Credentials', html, replyTo });
  return success;
}

/** The org admin, used as reply-to on credential emails. */
export async function orgAdminEmail(org: string): Promise<string | undefined> {
  const admin = await prisma.pesuser.findFirst({
    where: { org, role: { in: ['admin', 'Super user'] } },
    select: { email: true },
  });
  return admin?.email ?? undefined;
}
