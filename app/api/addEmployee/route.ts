import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { Prisma } from '@prisma/client'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'

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
  manage_user: boolean
  access_em: boolean
  ae_all: boolean
  ae_sub: boolean
  ae_sel: boolean
  define_performance: boolean
  dp_all: boolean
  dp_sub: boolean
  dp_sel: boolean
  access_hierachy: boolean
  manage_review: boolean
  mr_all: boolean
  mr_sub: boolean
  mr_sel: boolean
}


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
async function sendLoginEmail(to: string, name: string, password: string) {

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
    org,
    manage_user,
    access_em,
    ae_all,
    ae_sub,
    ae_sel,
    define_performance,
    dp_all,
    dp_sub,
    dp_sel,
    access_hierachy,
    manage_review,
    mr_all,
    mr_sub,
    mr_sel
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

    console.log("Creating user:", email)
    console.log("Role:", role)
    console.log("Org:", org)

    const user = await prisma.pesuser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gsm: gsm || null,
        role: role || null,
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

    // permission booleans are stored in String? columns (schema/DB drift), so cast.
    await prisma.permission.create({
      data: {
        manage_user: manage_user || false,
        access_em: access_em || false,
        ae_all: ae_all || false,
        ae_sub: ae_sub || false,
        ae_sel: ae_sel || false,
        define_performance: define_performance || false,
        dp_all: dp_all || false,
        dp_sub: dp_sub || false,
        dp_sel: dp_sel || false,
        access_hierachy: access_hierachy || false,
        manage_review: manage_review || false,
        mr_all: mr_all || false,
        mr_sub: mr_sub || false,
        mr_sel: mr_sel || false,
        user_id: String(user.id),
        org: org || null,
      } as unknown as Prisma.permissionUncheckedCreateInput,
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

  const reqInfo: ReqInfo = await req.json()

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

    if (result === 'success') {

      const emailSent = await sendLoginEmail(
        reqInfo.email,
        reqInfo.name,
        randPassword
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