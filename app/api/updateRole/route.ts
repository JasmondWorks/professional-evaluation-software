import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'
import { PRESET_ROLES, PERMISSION_KEYS, resolveBaseRole, PermissionKey } from '@/app/components/utils/roles'

// Update a role's permission template (and, for custom roles, its base_role).
// Editing a role is a live change: the new permissions are propagated to every
// current holder so the role behaves like a definition rather than a one-time
// copy. The role NAME is immutable (it's the identity/key).
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), { anyOf: ['can_manage_user_roles'] })
  if (!auth.ok) return auth.response

  const org = auth.user.org
  const body = await req.json()
  const roleName: string = body.roleName
  const base_role: string | undefined = body.base_role
  const permissions: Partial<Record<PermissionKey, boolean>> = body.permissions || {}

  if (!roleName || !org) {
    return NextResponse.json({ error: 'roleName is required' }, { status: 400 })
  }

  const isPreset = (PRESET_ROLES as readonly string[]).includes(roleName)

  try {
    const permData = Object.fromEntries(
      PERMISSION_KEYS.map((k) => [k, Boolean(permissions[k])]),
    ) as Record<PermissionKey, boolean>

    // 1) Update the role's permission template (keyed role:org:name).
    await prisma.permission.deleteMany({ where: { user_id: `role:${org}:${roleName}` } })
    await prisma.permission.create({
      data: { ...permData, user_id: `role:${org}:${roleName}`, org },
    })

    // 2) Custom roles may also change which preset they behave as.
    let newFunctionalRole: string | null = null
    if (!isPreset && base_role) {
      const resolved = resolveBaseRole(base_role)
      newFunctionalRole = resolved
      await prisma.roles.updateMany({ where: { name: roleName, org }, data: { base_role: resolved } })
    }

    // 3) Propagate to current holders so the edit takes effect immediately.
    const holders = await prisma.pesuser.findMany({
      where: { org, display_role: roleName },
      select: { id: true },
    })
    for (const h of holders) {
      await prisma.permission.deleteMany({ where: { user_id: String(h.id) } })
      await prisma.permission.create({ data: { ...permData, user_id: String(h.id), org } })
      if (newFunctionalRole) {
        await prisma.pesuser.update({ where: { id: h.id }, data: { role: newFunctionalRole } })
      }
    }

    return NextResponse.json(
      { message: `Role "${roleName}" updated.`, holders: holders.length },
      { status: 200 },
    )
  } catch (err) {
    console.error('updateRole error:', err)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}
