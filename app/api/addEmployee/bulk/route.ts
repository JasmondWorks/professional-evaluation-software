import { NextResponse } from 'next/server';
import prisma from '../../prisma.dev';
import { authorize, tokenFromRequest } from '../../_lib/authGuard';
import { runBulkUpload, type RowOutcome } from '../../_lib/bulkUpload';
import {
  createEmployee,
  generateUniquePassword,
  orgAdminEmail,
  presetRolesForCategory,
  resolveRoleName,
  sendLoginEmail,
  type EmployeeInput,
} from '../../_lib/createEmployee';
import { employeeUploadSpec } from '@/app/lib/bulk-upload/specs/employees';

/** Bulk employee creation. The generic runner does the row handling; this file
 *  only supplies what is specific to employees. See
 *  app/lib/bulk-upload/README.md. */

export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), { anyOf: ['can_access_employee_data'] });
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;
  if (!org) {
    return NextResponse.json(
      { message: 'This account is not attached to an organization.' },
      { status: 403 },
    );
  }

  // Which roles exist depends on the institution type: a company has no
  // lecturers. Read from the verified token, never from the file.
  const productCategory = auth.user.productCategory ?? auth.user.category ?? null;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Could not read the request.' }, { status: 400 });
  }

  // Roles are resolved once per distinct spelling rather than per row. The cache
  // is keyed on the lower-cased value so "HOD", "Hod" and "hod" share one lookup.
  const roleCache = new Map<string, string | null>();
  const canonicalRole = async (role: string) => {
    const key = String(role ?? '').trim().toLowerCase();
    if (!roleCache.has(key)) {
      roleCache.set(key, await resolveRoleName(org, role, productCategory));
    }
    return roleCache.get(key)!;
  };

  // Passwords are held until every row is decided, so the emails can go out in
  // one pass afterwards.
  const passwords = new Map<string, string>();

  return runBulkUpload<EmployeeInput>({
    rows: body?.rows,
    schema: employeeUploadSpec.schema,
    // The org comes from the verified token, never from the file, so a caller
    // cannot create employees in another organization.
    context: { org },
    dedupeKey: employeeUploadSpec.dedupeKey,
    maxRows: employeeUploadSpec.maxRows,

    precheck: async (row) => {
      const canonical = await canonicalRole(String(row.role));
      if (!canonical) {
        // Name the reason. "Does not exist" is misleading when the role exists
        // but belongs to a different kind of institution.
        const academicOnly = String(row.role).trim().toLowerCase() === 'lecturer';
        return academicOnly
          ? `The role "${row.role}" applies to academic institutions only, and this organization is registered as ${productCategory ?? 'non-academic'}.`
          : `The role "${row.role}" does not exist in this organization. Create it on the Roles page first.`;
      }
      // Write back the canonical spelling so the stored role is always the same
      // value regardless of how the spreadsheet capitalised it. The runner hands
      // this same object to create().
      row.role = canonical;
      return null;
    },

    create: async (row): Promise<RowOutcome> => {
      const password = generateUniquePassword();
      const outcome = await createEmployee(row, password);
      if (outcome.ok) {
        passwords.set(row.email, password);
        return { status: 'created', key: row.email, label: row.name };
      }
      // An email already in the system, or a second head for a department, is a
      // skip rather than a failure: nothing is wrong with the file, that person
      // simply cannot be created.
      const skippable = outcome.reason === 'email_exists' || outcome.reason === 'duplicate_employee';
      return {
        status: skippable ? 'skipped' : 'failed',
        reason: outcome.message,
        key: row.email,
        label: row.name,
      };
    },

    after: async (created) => {
      // Sent sequentially after creation, so a mail provider rate limit cannot
      // abort work that already succeeded. A failure is reported, not fatal:
      // the employee list has a resend action.
      const replyTo = await orgAdminEmail(org);
      let emailsSent = 0;
      const failedKeys: string[] = [];
      for (const { record } of created) {
        const password = passwords.get(record.email);
        if (!password) continue;
        try {
          const sent = await sendLoginEmail(record.email, record.name, password, replyTo);
          if (sent) emailsSent++;
          else failedKeys.push(record.email);
        } catch {
          failedKeys.push(record.email);
        }
      }
      return { emailsSent, failedKeys };
    },
  });
}

/** Existing keys and reference data, so the preview can mark a row as already
 *  registered or as naming a role that does not exist, before anything is sent. */
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), { anyOf: ['can_access_employee_data'] });
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;
  if (!org) return NextResponse.json({ existing: [], reference: { roles: [] } });

  const productCategory = auth.user.productCategory ?? auth.user.category ?? null;

  const [staff, roles] = await Promise.all([
    prisma.pesuser.findMany({ where: { org }, select: { email: true } }),
    prisma.roles.findMany({ where: { org }, select: { name: true } }),
  ]);

  return NextResponse.json({
    existing: staff.map((s) => s.email.toLowerCase()),
    reference: {
      // Only the presets this institution type may assign, so the preview
      // offers exactly what the server will accept.
      roles: Array.from(
        new Set([...presetRolesForCategory(productCategory), ...roles.map((r) => r.name)]),
      ),
    },
  });
}
