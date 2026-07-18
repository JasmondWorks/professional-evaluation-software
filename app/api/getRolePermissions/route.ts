// Returns the permission TEMPLATE for a custom role, so the Add-Employee form
// can pre-fill Step 2 when that role is selected. Role templates are stored by
// addRoles keyed as `role:${org}:${role_name}`.

import { NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { verifyToken } from '../_lib/authGuard';
import { PERMISSION_KEYS } from '@/app/components/utils/roles';

export async function POST(req: Request) {
  const { token, role } = await req.json();

  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!role || !user.org) return NextResponse.json({});

  try {
    const row = await prisma.permission.findFirst({
      where: { user_id: `role:${user.org}:${role}` },
    });

    // Return only the permission flags as an "on"/"" map the form can bind to.
    const perms: Record<string, string> = {};
    for (const key of PERMISSION_KEYS) {
      perms[key] = (row as any)?.[key] === 'on' ? 'on' : '';
    }
    return NextResponse.json(perms);
  } catch (err) {
    console.error('getRolePermissions error:', err);
    return NextResponse.json({});
  }
}
