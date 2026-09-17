import prisma from '../prisma.dev'
import { PRESET_ROLES, presetPermissionMap } from '@/app/components/utils/roles'
import { roleAllowedForCategory } from './createEmployee'

// Seed the system preset roles into an org as real `roles` rows (each with a
// permission template), so every role — preset or custom — is a uniform entity.
// Idempotent: safe to run repeatedly; existing rows are left untouched.
//
// `productCategory` decides which presets apply: seeding "lecturer" into a
// company put it back in that org's role list even after the preset list had
// filtered it out. Callers that do not know the category get the academic set,
// which is the superset, so nothing that used to be seeded goes missing.
export async function seedPresetRoles(orgId: string, productCategory?: string | null) {
  if (!orgId) return

  const presets = productCategory
    ? PRESET_ROLES.filter((p) => roleAllowedForCategory(p, productCategory))
    : PRESET_ROLES

  for (const preset of presets) {
    // The role row (base_role points at itself for a preset).
    await prisma.roles.upsert({
      where: { name_org_id: { name: preset, org_id: orgId } },
      update: {},
      create: { name: preset, org_id: orgId, base_role: preset, assigned: 0 },
    })

    // Its permission template, keyed the same way custom roles are.
    const templateUserId = `role:${orgId}:${preset}`
    const existing = await prisma.permission.findFirst({ where: { user_id: templateUserId } })
    if (!existing) {
      await prisma.permission.create({
        data: { ...presetPermissionMap(preset), user_id: templateUserId, org_id: orgId },
      })
    }
  }
}
