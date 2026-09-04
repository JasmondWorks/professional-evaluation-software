// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'
import { applyRoleToUser } from '../_lib/applyRole'
import { PRESET_ROLES } from '@/app/components/utils/roles'

// Managed role deletion. A role may be held by staff, so deletion first
// REASSIGNS every holder to a chosen replacement role, then removes the role and
// its permission template. Preset roles cannot be deleted (they're system roles
// seeded for every org).
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), { anyOf: ['can_manage_user_roles'] })
  if (!auth.ok) return auth.response

  const org = auth.user.org
  const { roleName, replacementRole } = await req.json()
  if (!roleName || !org) {
    return NextResponse.json({ error: 'roleName is required' }, { status: 400 })
  }
  if ((PRESET_ROLES as readonly string[]).includes(roleName)) {
    return NextResponse.json({ error: 'System preset roles cannot be deleted.' }, { status: 400 })
  }

  try {
    // Who currently holds this role (by display label).
    const holders = await prisma.pesuser.findMany({
      where: { org, display_role: roleName },
      select: { id: true },
    })

    if (holders.length > 0) {
      if (!replacementRole) {
        return NextResponse.json(
          { error: 'A replacement role is required because staff hold this role.', holders: holders.length },
          { status: 400 },
        )
      }
      if (replacementRole === roleName) {
        return NextResponse.json({ error: 'Replacement role must be different.' }, { status: 400 })
      }
      // Reassign every holder to the replacement role.
      for (const h of holders) {
        await applyRoleToUser(h.id, replacementRole, org)
      }
      // Credit the replacement role's assigned counter.
      await prisma.roles.updateMany({
        where: { name: replacementRole, org },
        data: { assigned: { increment: holders.length } },
      })
    }

    // Remove the role and its permission template.
    await prisma.permission.deleteMany({ where: { user_id: `role:${org}:${roleName}` } })
    await prisma.roles.deleteMany({ where: { name: roleName, org } })

    return NextResponse.json(
      { message: `Role "${roleName}" deleted.`, reassigned: holders.length },
      { status: 200 },
    )
  } catch (err) {
    console.error('deleteRole error:', err)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}
