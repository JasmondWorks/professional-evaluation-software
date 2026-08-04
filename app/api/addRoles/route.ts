import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { PERMISSION_KEYS, resolveBaseRole, PermissionKey } from '@/app/components/utils/roles'
import { validateData, createRoleSchema, formatZodErrors } from '@/app/lib/validation'

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

export async function POST(req: Request) {
  const body = await req.json()

  const validation = validateData(createRoleSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { message: 'Validation failed', details: formatZodErrors(validation.errors!) },
      { status: 400 }
    )
  }

  const reqInfo = body as reqInfo;

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
