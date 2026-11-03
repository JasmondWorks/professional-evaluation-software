import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../prisma.dev";
import { rateLimit } from "../_lib/rateLimit";
import { escapeHtml } from "../_lib/escapeHtml";
import { getJWTSecret } from "@/app/lib/jwt";
import {
  AUDITOR_QUESTIONS,
  hasRecognitionConsent,
  sanitizeCredentials,
} from "@/app/lib/auditor/questions";
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


// Deliberately public: an invited external auditor answers this before they
// have an account. Submissions land in a queue an admin must approve
// (/api/admin/auditors) before they become a user.
export async function POST(req: Request) {
  // Public, and each submission mails the admin, so bound it.
  const tooMany = rateLimit(req, { key: "auditor-responses", limit: 5, windowMs: 60 * 60_000 });
  if (tooMany) return tooMany;

  try {
    const body = await req.json();
    const { name, gsm, address, dob, image, responses, credentials, token } = body;

    // Identity comes from the signed invite, never from the request body. This
    // route is public, so a posted `email` was self-asserted: anyone could file
    // a submission under somebody else's address (the upsert is keyed on email,
    // so that also overwrote their pending record). The same token carries the
    // inviting org, which is the only trustworthy source for it.
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Missing invitation token" },
        { status: 400 },
      );
    }

    let email: string;
    let orgId: string | null;
    try {
      const decoded = jwt.verify(token, getJWTSecret()) as {
        email?: string;
        orgId?: string | null;
      };
      if (!decoded?.email) throw new Error("token carries no email");
      email = decoded.email;
      orgId = decoded.orgId ?? null;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 401 },
      );
    }

    if (!name || !gsm || !address || !dob || !responses) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Array.isArray(responses)) {
      return NextResponse.json(
        { error: "Responses must be an array" },
        { status: 400 },
      );
    }

    // Convert dob to a Date object
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format for dob" }, { status: 400 });
    }

    // The accept form uploads the credential files to Cloudinary and sends back
    // their URLs. Those were previously dropped here — the column did not
    // exist — leaving every uploaded certificate orphaned in storage with no
    // reference, which is why there was nothing for an admin to review.
    const credentialUrls = sanitizeCredentials(credentials);

    // Save into auditor_responses table
    const auditorData = {
      name,
      gsm,
      address,
      dob: dobDate,
      image: image || null,
      responses,
      credentials: credentialUrls,
      // Stored as a named flag, not re-derived from `responses` at each read:
      // it decides who may see the credentials above.
      recognition_consent: hasRecognitionConsent(responses),
      org_id: orgId,
      status: "pending",
    };
    await prisma.auditor_responses.upsert({
      where: { email },
      update: auditorData,
      create: { email, ...auditorData },
    });

    // Generate HTML table for the email
    const tableRows = AUDITOR_QUESTIONS
      .map(
        (question, index) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(question)}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(responses[index] || "No response")}</td>
          </tr>
        `
      )
      .join("");

    const emailHtml = `
      <h2>New Auditor Response</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email.replaceAll('%40', '@'))}</p>
      <p><strong>GSM:</strong> ${escapeHtml(gsm)}</p>
      <p><strong>Address:</strong> ${escapeHtml(address)}</p>
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
