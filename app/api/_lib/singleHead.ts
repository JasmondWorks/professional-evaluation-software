// Enforces "one head per scope": at most one Department Lead (hod) per
// department, and at most one Faculty/Division Head (unit-head) per faculty —
// within a single organization. Used by both employee creation and role
// assignment so the rule can't be bypassed by either path.

export type HeadRole = 'hod' | 'unit-head'

// Which employee field scopes each head role, and how to name it to the user.
export const HEAD_ROLE_CONFIG: Record<HeadRole, { field: 'dept' | 'faculty_college'; noun: string }> = {
  hod: { field: 'dept', noun: 'department' },
  'unit-head': { field: 'faculty_college', noun: 'faculty / division' },
}

export function isHeadRole(role: string): role is HeadRole {
  return role === 'hod' || role === 'unit-head'
}

export type HeadCheck =
  | { ok: true }
  | { ok: false; code: 'no-scope'; message: string }
  | { ok: false; code: 'taken'; message: string; existing: { id: number; name: string | null } }

// Returns ok, or the reason a person can't take this head role: they have no
// department/faculty set, or someone else already heads that scope.
export async function checkSingleHead(
  prisma: any,
  opts: {
    org: string
    role: string
    dept?: string | null
    faculty_college?: string | null
    excludeUserId?: number
  },
): Promise<HeadCheck> {
  const { org, role, excludeUserId } = opts
  if (!isHeadRole(role)) return { ok: true }

  const { field, noun } = HEAD_ROLE_CONFIG[role]
  const scope = (field === 'dept' ? opts.dept : opts.faculty_college)?.trim() || ''

  // A head must belong to the scope they lead.
  if (!scope) {
    return {
      ok: false,
      code: 'no-scope',
      message: `Set the employee's ${noun} before making them its head.`,
    }
  }

  const existing = await prisma.pesuser.findFirst({
    where: {
      org,
      role,
      [field]: scope,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true, name: true },
  })

  if (existing) {
    return {
      ok: false,
      code: 'taken',
      message: `${existing.name || 'Another employee'} is already the ${noun} head for “${scope}”. Reassign or change their role first.`,
      existing,
    }
  }

  return { ok: true }
}
