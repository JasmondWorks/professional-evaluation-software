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
    const auditors = await prisma.$queryRawUnsafe(
      `SELECT * FROM auditor_responses ORDER BY created_at DESC`
    );
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
    const auditor: any = await prisma.$queryRawUnsafe(
      `SELECT * FROM auditor_responses WHERE id = $1`,
      id
    );

    if (!auditor || auditor.length === 0) {
      return NextResponse.json({ error: "Auditor not found" }, { status: 404 });
    }

    const a = auditor[0];

    if (action === "approve") {
      // Check if auditor already exists in pesuser
      const existingAuditor: any = await prisma.$queryRawUnsafe(
        `SELECT id, audit_count FROM pesuser WHERE email = $1 AND role = 'auditor'`,
        a.email
      );

      if (existingAuditor.length > 0) {
        const count = existingAuditor[0].audit_count;
        if (count >= 3) {
          // Reject automatically
          await prisma.$queryRawUnsafe(
            `UPDATE auditor_responses SET status = 'rejected' WHERE id = $1`,
            id
          );
          return NextResponse.json({
            success: false,
            message: "Auditor audit limit reached (3), automatically rejected",
          });
        }

        // Increment audit_count if under limit
        await prisma.$queryRawUnsafe(
          `UPDATE pesuser SET audit_count = audit_count + 1 WHERE id = $1`,
          existingAuditor[0].id
        );
      } else {
        // New auditor, insert with audit_count = 1
        await prisma.$queryRawUnsafe(
          `INSERT INTO pesuser (name, email, password, gsm, role, address, dob, image, audit_count) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)`,
          a.name,
          a.email,
          "default_password",
          a.gsm,
          "auditor",
          a.address,
          a.dob,
          a.image
        );
      }

      // Update auditor_responses status
      await prisma.$queryRawUnsafe(
        `UPDATE auditor_responses SET status = 'approved' WHERE id = $1`,
        id
      );

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
      await prisma.$queryRawUnsafe(
        `UPDATE auditor_responses SET status = 'rejected' WHERE id = $1`,
        id
      );
      return NextResponse.json({ success: true, message: "Auditor rejected" });
    }
  } catch (error: any) {
    console.error("Error approving auditor:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
