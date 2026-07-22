import prisma from '../prisma.dev'
import { PRESET_ROLES, presetPermissionMap } from '@/app/components/utils/roles'

// Seed the system preset roles into an org as real `roles` rows (each with a
// permission template), so every role — preset or custom — is a uniform entity.
// Idempotent: safe to run repeatedly; existing rows are left untouched.
export async function seedPresetRoles(org: string) {
  if (!org) return

  for (const preset of PRESET_ROLES) {
    // The role row (base_role points at itself for a preset).
    await prisma.roles.upsert({
      where: { name_org: { name: preset, org } },
      update: {},
      create: { name: preset, org, base_role: preset, assigned: 0 },
    })

    // Its permission template, keyed the same way custom roles are.
    const templateUserId = `role:${org}:${preset}`
    const existing = await prisma.permission.findFirst({ where: { user_id: templateUserId } })
    if (!existing) {
      await prisma.permission.create({
        data: { ...presetPermissionMap(preset), user_id: templateUserId, org },
      })
    }
  }
}
