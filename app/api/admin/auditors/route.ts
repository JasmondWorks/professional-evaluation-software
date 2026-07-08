import { NextResponse } from "next/server";
import prisma from "../../prisma.dev";
import nodemailer from "nodemailer";

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Get all pending auditors
export async function GET() {
  try {
    const auditors = await prisma.auditor_responses.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(auditors);
  } catch (error: any) {
    console.error("Error fetching auditors:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Approve or Reject
export async function POST(req: Request) {
  try {
    const { id, action } = await req.json();

    if (!id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Fetch auditor details
    const a = await prisma.auditor_responses.findUnique({ where: { id } });

    if (!a) {
      return NextResponse.json({ error: "Auditor not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Check if auditor already exists in pesuser
      const existingAuditor = await prisma.pesuser.findFirst({
        where: { email: a.email, role: "auditor" },
        select: { id: true, audit_count: true },
      });

      if (existingAuditor) {
        if ((existingAuditor.audit_count ?? 0) >= 3) {
          // Reject automatically
          await prisma.auditor_responses.update({
            where: { id },
            data: { status: "rejected" },
          });
          return NextResponse.json({
            success: false,
            message: "Auditor audit limit reached (3), automatically rejected",
          });
        }

        // Increment audit_count if under limit
        await prisma.pesuser.update({
          where: { id: existingAuditor.id },
          data: { audit_count: { increment: 1 } },
        });
      } else {
        // New auditor, insert with audit_count = 1
        await prisma.pesuser.create({
          data: {
            name: a.name,
            email: a.email,
            password: "default_password",
            gsm: a.gsm,
            role: "auditor",
            address: a.address,
            dob: a.dob,
            image: a.image,
            audit_count: 1,
          },
        });
      }

      // Update auditor_responses status
      await prisma.auditor_responses.update({
        where: { id },
        data: { status: "approved" },
      });

      // Send success email
      await transporter.sendMail({
        from: `"Audit System" <${process.env.EMAIL_USER}>`,
        to: a.email,
        subject: "Approval Notification",
        html: `
          <h2>Congratulations, ${a.name}!</h2>
          <p>Your application as an auditor has been approved.</p>
          <p>You can now log in using:</p>
          <ul>
            <li>Email: ${a.email}</li>
            <li>Password: default_password</li>
          </ul>
          <p>Please change your password after first login.</p>
        `,
      });

      return NextResponse.json({
        success: true,
        message: "Auditor approved & added to system",
      });
    }

    if (action === "reject") {
      await prisma.auditor_responses.update({
        where: { id },
        data: { status: "rejected" },
      });
      return NextResponse.json({ success: true, message: "Auditor rejected" });
    }
  } catch (error: any) {
    console.error("Error approving auditor:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
