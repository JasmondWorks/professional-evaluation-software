import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'

const randombytes = require('randombytes')

function generateUniquePassword(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
  const randomBytes = randombytes(length)
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(randomBytes[i] % chars.length))
  }
  return password
}

async function sendLoginEmail(to: string, name: string, password: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.verify()

    await transporter.sendMail({
      from: `"Admin" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Your Login Credentials',
      html: `
        <div style="font-family: Arial; line-height: 1.6">
          <h2>Hello ${name},</h2>
          <p>Your login credentials have been reset.</p>
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p>Please log in and change your password immediately.</p>
        </div>
      `,
    })

    return true
  } catch (error) {
    console.error('EMAIL ERROR:', error)
    return false
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    // Check user exists
    const users: any[] = await prisma.$queryRaw`
      SELECT id, name FROM pesuser WHERE email = ${email}
    `

    if (!users.length) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const user = users[0]
    const newPassword = generateUniquePassword()
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in DB
    await prisma.$executeRaw`
      UPDATE pesuser SET password = ${hashedPassword} WHERE email = ${email}
    `

    await prisma.$disconnect()

    const emailSent = await sendLoginEmail(email, user.name, newPassword)

    if (!emailSent) {
      return NextResponse.json(
        { message: 'Password reset but email failed to send. Check SMTP configuration.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Credentials resent successfully', status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
