import prisma from '../prisma.dev'
import { PRESET_ROLES, PERMISSION_KEYS, resolveBaseRole } from '@/app/components/utils/roles'

// Apply a role (preset or custom) to an existing user: write the functional
// PRESET into pesuser.role, the selected name into display_role, and copy the
// role's permission template onto the user. Shared by assign-role and the
// role-deletion reassignment flow.
export async function applyRoleToUser(userId: string, roleName: string, org: string, orgId?: string | null) {
  const isPreset = (PRESET_ROLES as readonly string[]).includes(roleName)

  let functionalRole = roleName
  if (!isPreset) {
    const roleRow = await prisma.roles.findFirst({
      where: { name: roleName, ...(orgId != null ? { org_id: orgId } : { org }) },
      select: { base_role: true },
    })
    functionalRole = resolveBaseRole(roleRow?.base_role)
  }

  await prisma.pesuser.update({
    where: { id: userId },
    data: { role: functionalRole, display_role: roleName },
  })

  const tpl = await prisma.permission.findFirst({ where: { user_id: `role:${orgId}:${roleName}` } })
  if (tpl) {
    const template = Object.fromEntries(
      PERMISSION_KEYS.map((k) => [k, (tpl as any)[k] === true]),
    )
    await prisma.permission.deleteMany({ where: { user_id: userId } })
    await prisma.permission.create({ data: { ...template, user_id: userId, org_id: orgId ?? null } })
  }
}
