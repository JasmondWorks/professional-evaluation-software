// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize, tokenFromRequest } from '../_lib/authGuard'


async function getUser(user: string | null) {
  if (!user) return []

  return prisma.pesuser.findMany({
    where: { org: user },
    select: {
      id: true,
      name: true,
      email: true,
      gsm: true,
      role: true,
      display_role: true,
      address: true,
      dept: true,
      faculty_college: true,
      dob: true,
      doa: true,
      poa: true,
      doc: true,
      post: true,
      dopp: true,
      level: true,
      image: true,
      org: true,
      email_status: true,
    },
  })
}


/**
 * @swagger
 * /api/getEmployee:
 *   post:
 *     summary: Get employee information
 *     description: Retrieves a list of employees for the organization specified in the provided JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The JWT token containing the organization info.
 *     responses:
 *       200:
 *         description: A list of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   org:
 *                     type: string
 *       307:
 *         description: Redirect to /not-found if token is missing
 */
export async function POST(request: NextRequest) {

  // The token comes from the Authorization header, which apiFetch sets on every
  // request. It used to be read from the JSON body, which meant callers had to
  // pass it manually on top of the header apiFetch had already attached.
  const auth = authorize(tokenFromRequest(request), { roles: ['hod'], anyOf: ['can_access_employee_data'] })
  if (!auth.ok) return auth.response

  try {
    const userInfo = await getUser(auth.user.org ?? null)
    return NextResponse.json(userInfo)
  } catch (err) {
    console.error(err)
    return NextResponse.json([])
  }
}