import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'
import { PRESET_ROLES, PERMISSION_KEYS, resolveBaseRole } from '@/app/components/utils/roles'

// Assign ANY role (preset or custom) to an existing employee — the unified
// replacement for the old per-role assign-hod / assign-admin / assign-prod
// endpoints. Applies the same split as employee creation: the functional PRESET
// goes into pesuser.role (predictable UI) and the selected name into
// display_role; for custom roles the role's permission template is copied onto
// the employee.

export async function POST(req: Request) {
  // Reassigning roles requires the manage-user-roles capability (or admin tier).
  const auth = authorize(tokenFromRequest(req), { anyOf: ['can_manage_user_roles'] })
  if (!auth.ok) return auth.response

  const org = auth.user.org
  const { email, role } = await req.json()
  if (!email || !role || !org) {
    return NextResponse.json({ error: 'email and role are required' }, { status: 400 })
  }

  try {
    const user = await prisma.pesuser.findFirst({
      where: { email, org },
      select: { id: true, display_role: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'Employee not found in your organization' }, { status: 404 })
    }

    // Resolve the selected role → functional preset + permission template.
    // Presets are seeded as real roles (base_role = itself); custom roles map to
    // their base_role. Both carry a permission template we copy onto the user.
    const isPreset = (PRESET_ROLES as readonly string[]).includes(role)
    let functionalRole = role
    let template: Record<string, boolean> | null = null

    if (!isPreset) {
      const roleRow = await prisma.roles.findFirst({
        where: { name: role, org },
        select: { base_role: true },
      })
      functionalRole = resolveBaseRole(roleRow?.base_role)
    }

    const tpl = await prisma.permission.findFirst({
      where: { user_id: `role:${org}:${role}` },
    })
    if (tpl) {
      template = Object.fromEntries(
        PERMISSION_KEYS.map((k) => [k, (tpl as any)[k] === true]),
      )
    }

    // Update the employee's role + display label.
    await prisma.pesuser.update({
      where: { id: user.id },
      data: { role: functionalRole, display_role: role },
    })

    // For a custom role, copy its permission template onto the employee.
    if (template) {
      await prisma.permission.deleteMany({ where: { user_id: String(user.id) } })
      await prisma.permission.create({
        data: { ...template, user_id: String(user.id), org },
      })
    }

    // Keep the roles' assigned counters in step (all roles are real rows now).
    if (user.display_role && user.display_role !== role) {
      await prisma.roles.updateMany({
        where: { name: user.display_role, org },
        data: { assigned: { decrement: 1 } },
      })
      await prisma.roles.updateMany({
        where: { name: role, org },
        data: { assigned: { increment: 1 } },
      })
    }

    return NextResponse.json({ message: `Role updated to ${role}` }, { status: 200 })
  } catch (err) {
    console.error('assign-role error:', err)
    return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 })
  }
}
