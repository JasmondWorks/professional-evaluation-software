// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

// Per-employee capability grants, as shown on the employee record
// (/em-database/[user] → Permission settings).
//
// POST  { id }               → read this employee's permission row
// PUT   { id, permissions }  → replace it (requires can_manage_user_roles)
//
// Permissions are stored in the `permission` table keyed by `user_id` = the
// pesuser id as a string (the same key addEmployee writes and updateRole
// propagates to). Everything is scoped to the caller's org.

import { NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { authorize, hasAccess, tokenFromRequest } from '../_lib/authGuard';
import { PERMISSION_KEYS, PERMISSION_TREE, PermissionKey } from '@/app/components/utils/roles';

type PermMap = Record<PermissionKey, boolean>;

const emptyMap = (): PermMap =>
  Object.fromEntries(PERMISSION_KEYS.map((k) => [k, false])) as PermMap;

const toMap = (row: any): PermMap =>
  Object.fromEntries(PERMISSION_KEYS.map((k) => [k, row?.[k] === true])) as PermMap;

// A scope child is only meaningful when its parent capability is granted, so a
// parent that is off clears its children before anything is written.
function normalize(input: Partial<Record<string, boolean>>): PermMap {
  const out = emptyMap();
  for (const key of PERMISSION_KEYS) out[key] = input[key] === true;
  for (const parent of PERMISSION_TREE) {
    if (!out[parent.key]) {
      for (const child of parent.children) out[child.key] = false;
    }
  }
  return out;
}

// Resolve the target employee inside the caller's org (never outside it).
async function findStaff(id: unknown, org: string) {
  const numericId = Number(id);
  if (!numericId || Number.isNaN(numericId)) return null;
  return prisma.pesuser.findFirst({
    where: { id: numericId, org },
    select: { id: true, name: true, role: true, display_role: true },
  });
}

export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {
    anyOf: ['can_access_employee_data', 'can_manage_user_roles'],
  });
  if (!auth.ok) return auth.response;

  const org = auth.user.org;
  if (!org) return NextResponse.json({ error: 'Missing organization on your account.' }, { status: 400 });

  const { id } = await req.json().catch(() => ({ id: null }));
  const staff = await findStaff(id, org);
  if (!staff) {
    return NextResponse.json({ error: 'Staff member not found in your organization.' }, { status: 404 });
  }

  try {
    const row = await prisma.permission.findFirst({ where: { user_id: String(staff.id), org } });
    return NextResponse.json({
      permissions: toMap(row),
      // No row yet means the employee predates permission storage — the UI says
      // so rather than presenting an all-denied set as a deliberate choice.
      configured: Boolean(row),
      role: staff.display_role || staff.role || null,
      canEdit: hasAccess(auth.user, { anyOf: ['can_manage_user_roles'] }),
    });
  } catch (err) {
    console.error('employee-permissions read error:', err);
    return NextResponse.json({ error: 'Failed to load permissions.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = authorize(tokenFromRequest(req), { anyOf: ['can_manage_user_roles'] });
  if (!auth.ok) return auth.response;

  const org = auth.user.org;
  if (!org) return NextResponse.json({ error: 'Missing organization on your account.' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const staff = await findStaff(body.id, org);
  if (!staff) {
    return NextResponse.json({ error: 'Staff member not found in your organization.' }, { status: 404 });
  }

  const permissions = normalize(body.permissions || {});

  try {
    // One row per user: replace rather than accumulate (mirrors updateRole).
    await prisma.permission.deleteMany({ where: { user_id: String(staff.id) } });
    await prisma.permission.create({
      data: { ...permissions, user_id: String(staff.id), org },
    });
    return NextResponse.json({ success: true, permissions, configured: true });
  } catch (err) {
    console.error('employee-permissions write error:', err);
    return NextResponse.json({ error: 'Failed to save permissions.' }, { status: 500 });
  }
}
