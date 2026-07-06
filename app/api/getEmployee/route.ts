import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'


async function getUser(user: string | null) {

  const users = await prisma.$queryRaw`
    SELECT
      id,
      name,
      email,
      gsm,
      role,
      address,
      dept,
      faculty_college,
      dob,
      doa,
      poa,
      doc,
      post,
      dopp,
      level,
      image,
      org
    FROM pesuser
    WHERE org = ${user?.toString()}
  `

  await prisma.$disconnect()
  return users
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
  const decoded = jwt.decode(token)

  console.log('Decoded JWT:', decoded)

  if (token) {
    try {

      let userName: string | null = null

      if (decoded && typeof decoded === 'object' && 'org' in decoded) {
        userName = (decoded as { org?: string }).org ?? null
      }

      let userInfo = await getUser(userName)

      return NextResponse.json(userInfo)

    } catch (err) {

      console.error(err)
      return NextResponse.json([])

    }
  }

  return NextResponse.redirect(new URL('/not-found', request.url))
}