// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { authorize, tokenFromRequest } from '../_lib/authGuard'
import { validateData, addEmployeeSchema, formatZodErrors } from '@/app/lib/validation'
import {
  createEmployee,
  resolveRoleName,
  generateUniquePassword,
  orgAdminEmail,
  sendLoginEmail,
  type EmployeeInput,
} from '../_lib/createEmployee'

// The creation itself lives in ../_lib/createEmployee so the bulk upload runs
// the same path. Keeping a second copy here is how the two would drift until
// only one of them enforced the single-head rule or wrote the permission row.

export async function POST(req: Request) {
  // Server-side authorization: caller must be an admin or hold the
  // "can_access_employee_data" capability. Client-side gating alone can't
  // protect this write endpoint.
  const auth = authorize(tokenFromRequest(req), { anyOf: ['can_access_employee_data'] })
  if (!auth.ok) return auth.response

  const body: any = await req.json()

  // Bind the new employee to the caller's own org — never trust the org sent in
  // the body, so a user can't create employees in another organization.
  if (auth.user.org) body.org = auth.user.org

  const validation = validateData(addEmployeeSchema, body)
  if (!validation.success) {
    return NextResponse.json(
      { message: 'Validation failed', details: formatZodErrors(validation.errors!) },
      { status: 400 },
    )
  }

  try {
    // The form hides roles that do not apply to this institution type, but that
    // is presentation only: a direct post could still name one.
    const productCategory = auth.user.productCategory ?? auth.user.category ?? null
    const canonicalRole = await resolveRoleName(body.org, String(body.role), productCategory)
    if (!canonicalRole) {
      return NextResponse.json(
        {
          message:
            String(body.role).trim().toLowerCase() === 'lecturer'
              ? `The role "${body.role}" applies to academic institutions only.`
              : `The role "${body.role}" does not exist in this organization.`,
          status: 400,
        },
        { status: 200 },
      )
    }
    body.role = canonicalRole

    const password = generateUniquePassword()
    const result = await createEmployee(body as EmployeeInput, password)

    if (!result.ok) {
      const status = result.reason === 'error' ? 500 : 409
      return NextResponse.json({ message: result.message, status }, { status: 200 })
    }

    const emailSent = await sendLoginEmail(
      body.email,
      body.name,
      password,
      await orgAdminEmail(body.org),
    )

    if (!emailSent) {
      console.error('User created but email failed')
      return NextResponse.json({
        message: 'User created but email failed to send. You can resend the credentials from the employee list.',
        status: 201,
        emailFailed: true,
        email: body.email,
        name: body.name,
      })
    }

    return NextResponse.json({ message: 'User created and email sent!', status: 200 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ message: err.message })
  }
}
