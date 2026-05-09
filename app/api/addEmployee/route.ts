import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import nodemailer from 'nodemailer'
const randombytes = require('randombytes');

type reqInfo = {
  name: string
  email: string 
  password: string
  gsm: string
  role: string
  address: string
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
  manage_user: string
  access_em: string
  ae_all: string
  ae_sub: string
  ae_sel: string
  define_performance: string
  dp_all: string
  dp_sub: string
  dp_sel: string
  access_hierachy: string
  manage_review: string
  mr_all: string
  mr_sub: string
  mr_sel: string
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
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 443,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const html = `
      <div style="font-family: Arial; line-height: 1.6">
        <h2>Hello ${name},</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Email:</strong> ${to}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please log in and change your password immediately.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Admin" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your Login Credentials",
      html
    });    
  } catch (error) {
    console.error('the error:', error)
  }
}


// ---------------- INCREASE ASSIGNED COUNT -----------------
async function addAssigned(info: reqInfo){
  const { role , org } = info
  await prisma.$queryRaw`
    UPDATE roles
    SET assigned = assigned + 1
    WHERE name = ${role}
    AND org = ${org};
  `
}


// ---------------- INSERT USER INTO DB -----------------
async function addUser(info: reqInfo, randPassword: string) {
  const { 
    name, email, gsm, role, address, faculty_college,
    dob, doa, poa, doc, post, dopp, level, org,
    manage_user, access_em, ae_all, ae_sub, ae_sel,
    define_performance, dp_all, dp_sub, dp_sel,
    access_hierachy, manage_review, mr_all, mr_sub, mr_sel
  } = info

  try {
    const user: any = await prisma.$queryRaw`
      INSERT INTO pesuser 
      (name, email, password, gsm, role, address, faculty_college, dob, doa, poa, doc, post, dopp, level, image, org)
      VALUES (
        ${name}, ${email}, ${randPassword}, ${gsm}, ${role}, ${address}, ${faculty_college},
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
      (manage_user, access_em, ae_all, ae_sub, ae_sel, define_performance, dp_all, dp_sub, dp_sel, access_hierachy, manage_review, mr_all, mr_sub, mr_sel, user_id, org)
      VALUES (
        ${manage_user}, ${access_em}, ${ae_all}, ${ae_sub}, ${ae_sel}, 
        ${define_performance}, ${dp_all}, ${dp_sub}, ${dp_sel},
        ${access_hierachy}, ${manage_review}, ${mr_all}, ${mr_sub}, ${mr_sel},
        ${userId}, ${org}
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
  const reqInfo = await req.json()
  const randPassword = generateUniquePassword(); // generate new password for each request

  try {
    let result = await addUser(reqInfo, randPassword)

    if (result === 'success') {

      // 🔥 SEND LOGIN EMAIL
      await sendLoginEmail(reqInfo.email, reqInfo.name, randPassword)

      return NextResponse.json({ message: 'User created and email sent!', status: 200 })
    } else {
      return NextResponse.json({ message: 'There was a problem', status: 500 })
    }

  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: err.message })
  }
}
