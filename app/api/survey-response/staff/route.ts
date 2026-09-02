import { NextResponse } from "next/server";
import prisma from "../../prisma.dev"; // your Prisma client
import { rateLimit } from "../../_lib/rateLimit";
import nodemailer from "nodemailer";

// Deliberately public: the staff survey is answered from a link, by people who
// are not necessarily signed in. It only ever inserts a response; it reads
// nothing back, so there is nothing here to disclose.
export async function POST(req: Request) {
  // Public, so the only thing standing between it and an insert flood is this.
  const tooMany = rateLimit(req, { key: "survey-staff", limit: 10, windowMs: 60 * 60_000 });
  if (tooMany) return tooMany;

  try {
    const body = await req.json();
    const {
      pesuser_name,
      pesuser_email,
      org,
      dept,
      responses, // e.g. { q1: "Yes", q2: "No", q3: "Maybe" }
    } = body;

    if (!pesuser_name || !pesuser_email || !responses) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // === 1. Save to DB ===
    await prisma.staff_survey_responses.create({
      data: { pesuser_name, pesuser_email, org, dept, responses },
    });

    // === 2. Send email to admin ===
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"PES System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `📝 New Staff Survey Submitted - ${org || "Unknown Org"}`,
      html: `
        <div style="font-family:Arial,sans-serif; padding:10px; background:#f9fafb;">
          <h2 style="color:#2563eb;">New Staff Survey Submitted</h2>
          <p><strong>Name:</strong> ${pesuser_name}</p>
          <p><strong>Email:</strong> ${pesuser_email}</p>
          <p><strong>Department:</strong> ${dept || "N/A"}</p>
          <p><strong>Organization:</strong> ${org || "N/A"}</p>
          <hr style="margin:15px 0;"/>
          <h4>Responses:</h4>
          <pre style="background:#fff;border:1px solid #ddd;padding:10px;border-radius:6px;">${JSON.stringify(
            responses,
            null,
            2
          )}</pre>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Survey response saved and email sent to admin.",
    });
  } catch (err: any) {
    console.error("❌ Error saving survey:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save staff survey" },
      { status: 500 }
    );
  }
}
