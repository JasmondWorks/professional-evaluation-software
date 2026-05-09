import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'

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
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
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
      from: `"Admin" <${process.env.SMTP_USER}>`,
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

  await prisma.$queryRaw`
    UPDATE roles
    SET assigned = assigned + 1
    WHERE name = ${role}
    AND org = ${org};
  `
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

    const existingUser: any = await prisma.$queryRaw`
      SELECT id FROM pesuser
      WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return 'email_exists'
    }

    const hashedPassword = await bcrypt.hash(randPassword, 10)

    console.log("Creating user:", email)
    console.log("Role:", role)
    console.log("Org:", org)

    const user: any = await prisma.$queryRaw`
      INSERT INTO pesuser 
      (
        name,
        email,
        password,
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
      )

      VALUES (
        ${name},
        ${email},
        ${hashedPassword},
        ${gsm},
        ${role},
        ${address},
        ${dept},
        ${faculty_college},
        ${dob ? new Date(dob) : null},
        ${doa ? new Date(doa) : null},
        ${sanitizeString(poa) || null},
        ${doc ? new Date(doc) : null},
        ${sanitizeString(post) || null},
        ${dopp ? new Date(dopp) : null},
        ${sanitizeString(level) || null},
        NULL,
        ${org}
      )

      RETURNING id;
    `

    const userId = user[0].id

    await prisma.$queryRaw`
      INSERT INTO permission 
      (
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
        mr_sel,
        user_id,
        org
      )

      VALUES (
        ${manage_user},
        ${access_em},
        ${ae_all},
        ${ae_sub},
        ${ae_sel},
        ${define_performance},
        ${dp_all},
        ${dp_sub},
        ${dp_sel},
        ${access_hierachy},
        ${manage_review},
        ${mr_all},
        ${mr_sub},
        ${mr_sel},
        ${userId},
        ${org}
      );
    `

    await addAssigned(info)

    return 'success'

  } catch (error) {
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
        message: 'Email already exists',
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
      }

      return NextResponse.json({
        message: 'User created and email sent!',
        status: 200
      })

    } else {

      return NextResponse.json({
        message: 'There was a problem',
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