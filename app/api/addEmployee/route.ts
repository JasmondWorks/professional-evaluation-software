import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { Prisma } from '@prisma/client'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'
import { authorize, tokenFromRequest } from '../_lib/authGuard'
import { PRESET_ROLES, resolveBaseRole, PermissionKey } from '@/app/components/utils/roles'
import { checkSingleHead } from '../_lib/singleHead'

const randombytes = require('randombytes');

type ReqInfo = {
  name: string
  email: string 
  password: string
  gsm: string
  role: string
  address: string
  dept: string
  faculty_college: string
  dob: string
  doa: string
  poa: string | null
  doc: string | null
  post: string | null
  dopp: string
  level: string | null
  image: string | null
  org: string
  can_manage_user_roles: boolean
  can_access_employee_data: boolean
  access_employee_all: boolean
  access_employee_subordinates: boolean
  access_employee_selected: boolean
  can_define_performance_metrics: boolean
  define_performance_all: boolean
  define_performance_subordinates: boolean
  define_performance_selected: boolean
  can_access_reporting_hierarchy: boolean
  can_manage_performance_reviews: boolean
  manage_reviews_all: boolean
  manage_reviews_subordinates: boolean
  manage_reviews_selected: boolean
}

// The permission keys, so we can copy them straight from the request body.
const PERMISSION_FIELDS: PermissionKey[] = [
  'can_manage_user_roles',
  'can_access_employee_data',
  'access_employee_all',
  'access_employee_subordinates',
  'access_employee_selected',
  'can_define_performance_metrics',
  'define_performance_all',
  'define_performance_subordinates',
  'define_performance_selected',
  'can_access_reporting_hierarchy',
  'can_manage_performance_reviews',
  'manage_reviews_all',
  'manage_reviews_subordinates',
  'manage_reviews_selected',
]


// ---------------- PASSWORD GENERATOR -----------------
function generateUniquePassword(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  const randomBytes = randombytes(length);
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(randomBytes[i] % chars.length);
    password += chars.charAt(randomIndex);
  }

  return password;
}

function sanitizeString(val?: string | null) {
  if (!val) return null
  return val.replace(/\u0000/g, '')
}


// ---------------- SEND EMAIL (IN SAME FILE) -----------------
async function sendLoginEmail(to: string, name: string, password: string, replyTo?: string) {

  console.log("Preparing email transport...")

  try {

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log("Transport created")

    const verifyTransport = await transporter.verify()

    console.log("SMTP verified:", verifyTransport)

    const html = `
      <div style="font-family: Arial; line-height: 1.6">
        <h2>Hello ${name},</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Email:</strong> ${to}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please log in and change your password immediately.</p>
      </div>
    `;

    console.log("Sending email to:", to)

    const info = await transporter.sendMail({
      from: `"Admin" <${process.env.EMAIL_USER}>`,
      replyTo: replyTo || process.env.EMAIL_USER,
      to,
      subject: "Your Login Credentials",
      html
    });

    console.log("Email sent successfully")
    console.log("Message ID:", info.messageId)
    console.log("Accepted:", info.accepted)
    console.log("Rejected:", info.rejected)

    return true

  } catch (error) {

    console.error("EMAIL ERROR:")
    console.error(error)

    return false
  }
}


// ---------------- INCREASE ASSIGNED COUNT -----------------
async function addAssigned(info: ReqInfo){
  const { role , org } = info

  await prisma.roles.updateMany({
    where: { name: role, org },
    data: { assigned: { increment: 1 } },
  })
}


// ---------------- INSERT USER INTO DB -----------------
async function addUser(info: ReqInfo, randPassword: string) {
  const {
    name, email, gsm, role, address, dept, faculty_college,
    dob, doa, poa, doc, post, dopp, level, org,
  } = info

  try {

    const existingUser = await prisma.pesuser.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return 'email_exists'
    }

    const hashedPassword = await bcrypt.hash(randPassword, 10)

    // Resolve the SELECTED role into a functional preset (stored in role) and a
    // display label (stored in display_role). A preset selection stays itself; a
    // custom role maps to its base_role preset so role-based UI stays predictable
    // while the custom name is still shown to users.
    let functionalRole: string
    let displayRole: string = role
    if ((PRESET_ROLES as readonly string[]).includes(role)) {
      functionalRole = role
    } else {
      const roleRow = await prisma.roles.findFirst({
        where: { name: role, org },
        select: { base_role: true },
      })
      functionalRole = resolveBaseRole(roleRow?.base_role)
    }

    // One head per scope: refuse a second HOD for the department, or a second
    // faculty/division head for the faculty, within this org.
    const headCheck = await checkSingleHead(prisma, {
      org,
      role: functionalRole,
      dept,
      faculty_college,
    })
    if (!headCheck.ok) {
      return `head_conflict:${headCheck.message}`
    }

    console.log("Creating user:", email, "| selected role:", role, "→ functional:", functionalRole)

    const user = await prisma.pesuser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gsm: gsm || null,
        role: functionalRole,
        display_role: displayRole || null,
        address: address || null,
        dept: dept || null,
        faculty_college: faculty_college || null,
        dob: dob ? new Date(dob) : null,
        doa: doa ? new Date(doa) : null,
        poa: sanitizeString(poa),
        doc: sanitizeString(doc),
        post: sanitizeString(post),
        dopp: dopp ? new Date(dopp) : null,
        level: sanitizeString(level),
        image: null,
        org: org || null,
      },
      select: { id: true },
    })

    // Permission columns are booleans now. Copy the granted capabilities straight
    // from the request body.
    const permissionData = Object.fromEntries(
      PERMISSION_FIELDS.map((k) => [k, Boolean((info as any)[k])]),
    )

    await prisma.permission.create({
      data: {
        ...permissionData,
        user_id: String(user.id),
        org: org || null,
      },
    })

    await addAssigned(info)

    return 'success'

  } catch (error) {
    // Unique constraint (e.g. same name+dept+org, or duplicate email) → friendly signal.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return 'duplicate_employee'
    }
    console.error(error)
    return error
  }
}


// ---------------- POST HANDLER -----------------
export async function POST(req: Request) {

  // Server-side authorization: caller must be an admin or hold the "can_access_employee_data"
  // capability. Client-side gating alone can't protect this write endpoint.
  const auth = authorize(tokenFromRequest(req), { anyOf: ['can_access_employee_data'] })
  if (!auth.ok) return auth.response

  const reqInfo: ReqInfo = await req.json()

  // Bind the new employee to the caller's own org — never trust the org sent in
  // the body, so a user can't create employees in another organization.
  if (auth.user.org) reqInfo.org = auth.user.org

  const randPassword = generateUniquePassword();

  try {

    const result = await addUser(reqInfo, randPassword)

    if (result === 'email_exists') {

      return NextResponse.json({
        message: 'An employee with this email already exists.',
        status: 409
      })

    }

    if (result === 'duplicate_employee') {

      return NextResponse.json({
        message: `${reqInfo.name} is already registered in the ${reqInfo.dept} department.`,
        status: 409
      })

    }

    if (typeof result === 'string' && result.startsWith('head_conflict:')) {

      return NextResponse.json({
        message: result.slice('head_conflict:'.length),
        status: 409
      })

    }

    if (result === 'success') {

      // Find org admin for reply-to
      const orgAdmin = await prisma.pesuser.findFirst({
        where: { org: reqInfo.org, role: { in: ['admin', 'Super user'] } },
        select: { email: true }
      })

      const emailSent = await sendLoginEmail(
        reqInfo.email,
        reqInfo.name,
        randPassword,
        orgAdmin?.email
      )

      if (!emailSent) {
        console.error("User created but email failed")
        return NextResponse.json({
          message: 'User created but email failed to send. You can resend the credentials from the employee list.',
          status: 201,
          emailFailed: true,
          email: reqInfo.email,
          name: reqInfo.name
        })
      }

      return NextResponse.json({
        message: 'User created and email sent!',
        status: 200
      })

    } else {

      return NextResponse.json({
        message: result instanceof Error ? result.message : 'There was a problem',
        errorDetails: result,
        status: 500
      })

    }

  } catch (err: any) {

    console.error(err)

    return NextResponse.json({
      message: err.message
    })

  }
}