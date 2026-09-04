// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    // jwtDecode parses a token without checking its signature, so this org was
    // whatever the caller wrote into one.
    const auth = authorize(tokenFromRequest(req), { anyOf: ['can_manage_user_roles'] });
    if (!auth.ok) return auth.response;

    const org = auth.user.org ? String(auth.user.org) : null;
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
        data: { role: "dept-admin" },
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
      subject: "You have been assigned as Admin",
      text: `Dear ${user.name},\n\nYou have been officially assigned as Admin at ${org}.\n\nCongratulations!\n\nBest,\nAdmin`,
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
