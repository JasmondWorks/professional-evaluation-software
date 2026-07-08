import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { jwtDecode } from "jwt-decode";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let org;
    try {
      const decoded: any = jwtDecode(token);
      org = decoded?.org;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!org) return NextResponse.json({ error: "Org missing in token" }, { status: 400 });

    const { email, dept } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.pesuser.findUnique({ where: { email } });
    if (!existingUser || existingUser.org !== org) {
      return NextResponse.json({ error: "User not found or unauthorized" }, { status: 404 });
    }

    // ✅ Update role in DB
    const user = await prisma.pesuser
      .update({
        where: { email },
        data: { role: "hod" },
        select: { name: true, email: true, role: true, org: true, dept: true },
      })
      .catch(() => null);

    if (!user) {
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
