import { NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { rateLimit } from "../_lib/rateLimit";
import nodemailer from "nodemailer";

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // You can use other services like Outlook, Yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

/**
 * CREATE (Submit Responses)
 */

const questions = [
  "Will you be validating the input data for the current Appraisal and evaluation period?",
  "Will you be validating the entire process based on accountability and fair judgment?",
  "Will your validating of the process be based on Guided Standard which you will make available at the end of the process?",
  "Will exceptions be raised for conflicts detected in the system?",
  "Will your roles as an invited external auditor be independent?",
  "Are you ready to suggest workable frameworks where you deem it fit?",
  "Do you accept that your Management letter at the end of the process be made available to the management?",
  "Where awards are applicable for motivation purposes as suggested by the system software, will you validate to ensure that there isn’t marginalization or nepotism?",
  "Are you welcome to open criticism?",
  "If invited again in the future, will you accept the invitation even if you were openly criticized?",
];

// Deliberately public: an invited external auditor answers this before they
// have an account. Submissions land in a queue an admin must approve
// (/api/admin/auditors) before they become a user.
export async function POST(req: Request) {
  // Public, and each submission mails the admin, so bound it.
  const tooMany = rateLimit(req, { key: "auditor-responses", limit: 5, windowMs: 60 * 60_000 });
  if (tooMany) return tooMany;

  try {
    const body = await req.json();
    const { name, email, gsm, address, dob, image, responses } = body;

    if (!name || !email || !gsm || !address || !dob || !responses) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert dob to a Date object
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format for dob" }, { status: 400 });
    }

    // Save into auditor_responses table
    const auditorData = {
      name,
      gsm,
      address,
      dob: dobDate,
      image: image || null,
      responses,
      status: "pending",
    };
    await prisma.auditor_responses.upsert({
      where: { email },
      update: auditorData,
      create: { email, ...auditorData },
    });

    // Generate HTML table for the email
    const tableRows = questions
      .map(
        (question, index) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${question}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${responses[index] || "No response"}</td>
          </tr>
        `
      )
      .join("");

    const emailHtml = `
      <h2>New Auditor Response</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email.replaceAll('%40', '@')}</p>
      <p><strong>GSM:</strong> ${gsm}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Date of Birth:</strong> ${dobDate.toDateString()}</p>
      <p><strong>Responses:</strong></p>
      <table style="border-collapse: collapse; width: 100%; text-align: left;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">#</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Question</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Response</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    // Send notification email to Admin
    const adminEmail = process.env.EMAIL_USER;
    await transporter.sendMail({
      from: `"Audit System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: "New Auditor Response Submitted",
      html: emailHtml,
    });

    return NextResponse.json({ message: "Responses submitted successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to submit responses" }, { status: 500 });
  }
}
