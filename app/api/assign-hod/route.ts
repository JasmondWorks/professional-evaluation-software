import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, org, dept } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // ✅ Update role in DB
    const updatedUser = await prisma.$queryRawUnsafe<Array<{ name: string; email: string; role: string; org: string; dept: string }>>(`
      UPDATE pesuser
      SET role = 'hod'
      WHERE email = '${email}'
      RETURNING name, email, role, org, dept;
    `);

    if (!updatedUser || updatedUser.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Send email notification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const user = updatedUser[0];

    const mailOptions = {
      from: `"Admin" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "You have been assigned as Head of Department",
      text: `Dear ${user.name},\n\nYou have been officially assigned as Head of Department (${dept}) at ${org}.\n\nCongratulations!\n\nBest,\nAdmin`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: `Successfully assigned ${user.name} as Head of Department and sent email.`,
      user,
    });
  } catch (error: any) {
    console.error("Error assigning HOD:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
