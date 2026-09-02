import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { PERMISSION_KEYS, resolveBaseRole, PermissionKey } from '@/app/components/utils/roles'
import { validateData, createRoleSchema, formatZodErrors } from '@/app/lib/validation'
import { authorize, tokenFromRequest } from '../_lib/authGuard'

type reqInfo = {
    role_name: string
    description: string
    org: string
    base_role: string
} & Partial<Record<PermissionKey, boolean>>

async function addUser(info: reqInfo) {
    const { role_name, org, base_role } = info

    // Which system preset this custom role behaves as (defaults to baseline).
    const baseRole = resolveBaseRole(base_role)

    // Copy the granted capabilities (booleans) straight from the body.
    const permissionData = Object.fromEntries(
        PERMISSION_KEYS.map((k) => [k, Boolean(info[k])]),
    )

    try {
        await prisma.roles.create({
            data: { name: role_name, assigned: 1, org, base_role: baseRole },
        })

        // Store this role's permission TEMPLATE, namespaced by role name so it
        // can be looked up later (e.g. to pre-fill Add-Employee).
        await prisma.permission.create({
            data: {
                ...permissionData,
                user_id: `role:${org}:${role_name}`,
                org,
            },
        })

        return `success`
    } catch(error) {
        return error
    }
}

// Creates a custom role, with its permission template, for the org named in the
// body — unauthenticated, so anyone could mint a role carrying any capability
// into anyone's organization. Both the permission to do it and the org it lands
// in now come from the token.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {
    anyOf: ['can_manage_user_roles'],
  })
  if (!auth.ok) return auth.response

  const body = await req.json()

  const validation = validateData(createRoleSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { message: 'Validation failed', details: formatZodErrors(validation.errors!) },
      { status: 400 }
    )
  }

  // The org is not the caller's to choose.
  const reqInfo = { ...(body as reqInfo), org: String(auth.user.org ?? '') };
  if (!reqInfo.org) {
    return NextResponse.json(
      { message: 'This account is not attached to an organization' },
      { status: 403 },
    )
  }

   try {
      let data = await addUser(reqInfo)
      console.log(data);
      if (data == 'success') {
        return NextResponse.json({ message: 'Role created successfully!', status: 200 })
      } else {
        return NextResponse.json({ message: 'There was a problem', status: 500})
      }
   } catch (err) {
      console.error(err)
      return NextResponse.json({ message: 'Invalid credentials'})
   }
}
