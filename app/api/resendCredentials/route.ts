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
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.verify()

    await transporter.sendMail({
      from: `"Admin" <${process.env.EMAIL_USER}>`,
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
    const user = await prisma.pesuser.findUnique({
      where: { email },
      select: { id: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const newPassword = generateUniquePassword()
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in DB
    await prisma.pesuser.update({
      where: { email },
      data: { password: hashedPassword },
    })

    const emailSent = await sendLoginEmail(email, user.name, newPassword)

    if (!emailSent) {
      console.warn(`⚠️ EMAIL FAILED. Dev Mode: The new password for ${email} is: ${newPassword}`);
      return NextResponse.json(
        { message: 'Password reset successful, but email failed. Check server console for new password.', status: 200 },
        { status: 200 }
      )
    }

    return NextResponse.json({ message: 'Credentials resent successfully', status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
