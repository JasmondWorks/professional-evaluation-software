import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "../prisma.dev";
import { rateLimit } from "../_lib/rateLimit";
import { escapeHtml } from "../_lib/escapeHtml";
import { AUDITOR_QUESTIONS, GLOBAL_RECOGNITION_QUESTION_INDEX } from "@/app/lib/auditorQuestions";
import { authorize, tokenFromRequest } from "../_lib/authGuard";
import nodemailer from "nodemailer";

// Only Cloudinary-hosted https URLs are trusted as credential links — the
// upload widget always returns one, so anything else is either a bad client
// or a deliberately crafted javascript:/data: URL aimed at whoever opens the
// review queue and clicks a "document" link.
function sanitizeCredentialData(input: unknown): Record<string, string> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const out: Record<string, string> = {};
  for (const [label, value] of Object.entries(input as Record<string, unknown>)) {
    if (typeof value !== "string" || !value) continue;
    try {
      const parsed = new URL(value);
      if (parsed.protocol === "https:" && parsed.hostname.endsWith("cloudinary.com")) {
        out[label] = value;
      }
    } catch {
      // Not a valid URL — drop it.
    }
  }
  return Object.keys(out).length ? out : null;
}

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // You can use other services like Outlook, Yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

const questions = AUDITOR_QUESTIONS;

// An invited auditor's own onboarding status — used by the questionnaire
// page to decide whether to show the form or an "already submitted" state.
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), { roles: ["auditor"], allowAdmins: false });
  if (!auth.ok) return auth.response;

  const email = auth.user.email;
  const userId = auth.user.userID;
  if (!email || !userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.auditor_responses.findUnique({
    where: { email },
    select: { status: true, created_at: true },
  });
  const account = await prisma.pesuser.findUnique({
    where: { id: userId },
    select: { globally_recognized: true, global_recognition_status: true },
  });

  return NextResponse.json({
    submission: existing
      ? {
          ...existing,
          globally_recognized: account?.globally_recognized ?? false,
          global_recognition_status: account?.global_recognition_status ?? null,
        }
      : null,
  });
}

// Requires an authenticated auditor session — the account is created by the
// inviting org admin (see /api/send-email) and the auditor must set their
// password and log in before reaching this. Previously this was reachable
// with no account at all, gated only by a JWT embedded in the invite link.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), { roles: ["auditor"], allowAdmins: false });
  if (!auth.ok) return auth.response;

  // Public no longer applies, but a motivated account could still hammer this
  // with uploads — keep the same bound.
  const tooMany = rateLimit(req, { key: "auditor-responses", limit: 5, windowMs: 60 * 60_000 });
  if (tooMany) return tooMany;

  // email and org_id are never taken from the request body — both come from
  // the authenticated session, so a submitter can only ever file against
  // their own account and the org that actually invited them.
  const email = auth.user.email;
  const orgId = auth.user.orgId ?? null;
  const userId = auth.user.userID;
  if (!email || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!orgId) {
    return NextResponse.json({ error: "Your account is not attached to an organization" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, gsm, address, dob, image, responses, credentialData } = body;

    if (!name || !gsm || !address || !dob || !responses) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert dob to a Date object
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format for dob" }, { status: 400 });
    }

    // An org that has REMOVED this auditor must be the one to re-add them —
    // resubmitting this form must not be a way to quietly reinstate yourself.
    // org_auditor is the authoritative per-org record (auditor_responses is a
    // single row per email and isn't precise enough to gate on alone).
    const existingPair = await prisma.org_auditor.findFirst({ where: { org_id: orgId, auditor_id: userId } });
    if (existingPair?.status === "ended") {
      return NextResponse.json(
        { error: "You were removed from this organization. Contact them to be re-added." },
        { status: 403 },
      );
    }

    const current = await prisma.pesuser.findUnique({
      where: { id: userId },
      select: { globally_recognized: true },
    });

    // Local (not-yet-globally-recognized) auditors may only hold one active
    // org association at a time; a globally recognized auditor reaching this
    // path (re-submitting for a second org) may hold several.
    if (!current?.globally_recognized) {
      const otherActive = await prisma.org_auditor.findFirst({
        where: { auditor_id: userId, status: "active", org_id: { not: orgId } },
      });
      if (otherActive) {
        return NextResponse.json(
          {
            error:
              "You already have an active association with another organization and are not globally recognized, so you cannot be activated here until that association ends.",
          },
          { status: 409 },
        );
      }
    }

    const wantsGlobalRecognition =
      Array.isArray(responses) && String(responses[GLOBAL_RECOGNITION_QUESTION_INDEX]).toLowerCase() === "yes";

    // The account already holds the real 'auditor' role (granted at invite
    // time — the org admin inviting them by name is itself the authorization)
    // so submitting this just fills in the real details and activates the
    // org association; there is no separate "approve" step on the other side.
    // The client was explicit that an approval step only exists for GLOBAL
    // recognition (see global_recognition_status below). Everything below is
    // one transaction so a request rejected above (removed, or already active
    // elsewhere) never leaves a half-created association behind.
    const auditorData = {
      name,
      gsm,
      address,
      dob: dobDate,
      image: image || null,
      responses,
      org_id: orgId,
      credential_data: sanitizeCredentialData(credentialData) ?? Prisma.JsonNull,
      status: "approved",
    };
    await prisma.$transaction([
      prisma.auditor_responses.upsert({
        where: { email },
        update: auditorData,
        create: { email, ...auditorData },
      }),
      prisma.pesuser.update({
        where: { id: userId },
        data: {
          name,
          gsm,
          address,
          dob: dobDate,
          image: image || null,
          ...(wantsGlobalRecognition && !current?.globally_recognized
            ? { global_recognition_status: "pending", global_recognition_requested_at: new Date() }
            : {}),
        },
      }),
      existingPair
        ? prisma.org_auditor.update({ where: { id: existingPair.id }, data: { status: "active" } })
        : prisma.org_auditor.create({
            data: { org_id: orgId, auditor_id: userId, status: "active", consecutive_years: 1 },
          }),
    ]);

    // Generate HTML table for the email
    const tableRows = questions
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
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
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
