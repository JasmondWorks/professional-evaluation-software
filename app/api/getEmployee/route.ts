import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { authorize } from '../_lib/authGuard'


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

  const { token } = await request.json()

  // Employee database is visible to admins, HODs, or anyone granted access_em.
  // Uses the verified token's org, so the list is always scoped to the caller.
  const auth = authorize(token, { roles: ['hod'], anyOf: ['access_em'] })
  if (!auth.ok) return auth.response

  try {
    const userInfo = await getUser(auth.user.org ?? null)
    return NextResponse.json(userInfo)
  } catch (err) {
    console.error(err)
    return NextResponse.json([])
  }
}