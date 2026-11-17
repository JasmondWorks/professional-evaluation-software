export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../prisma.dev";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { tokenFromRequest } from "../../_lib/authGuard";
import { consoleViewer } from "../_scope";
import { issuePasswordToken, passwordLink } from "@/app/lib/auth/passwordToken";
import { escapeHtml } from "../../_lib/escapeHtml";
import { auditorDocumentsFor } from "@/app/lib/auditor/credentialAccess";

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// The submissions an admin vets. This is where credentials matter most — it is
// the screen on which someone decides whether to approve an auditor at all.
//
// Two defects fixed here. The query was `findMany()` with no `where` and no
// `select`, so (1) an ORGANIZATION admin received every other organization's
// auditor submissions, and (2) every column went out with them, including the
// raw `credentials` payload and `recognition_consent` — which made the consent
// gating on /api/admin/all-auditors pointless, since the same documents were
// already reachable here without it.
//
// Pre-migration rows have a null `org_id` (their inviting org was never
// recorded and is not recoverable), so they are visible only to the platform
// operator. Dropping them from an org admin's list is the safe direction: the
// alternative is showing each of them to every tenant.
export async function GET(req: Request) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

  try {
    const rows = await prisma.auditor_responses.findMany({
      where: auth.viewer.isPlatform ? {} : { org_id: auth.viewer.orgId },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        gsm: true,
        dob: true,
        address: true,
        image: true,
        responses: true,
        status: true,
        created_at: true,
        org_id: true,
        credentials: true,
        recognition_consent: true,
        rejection_reason: true,
        reviewed_at: true,
      },
    });

    // Same gate as /api/admin/all-auditors, via the shared helper. The first
    // revision of this route returned documents to the operator regardless of
    // consent, which defeated the gate on that sibling endpoint entirely.
    const auditors = rows.map(({ credentials, recognition_consent, ...rest }) => ({
      ...rest,
      recognitionConsent: recognition_consent,
      documents: auditorDocumentsFor(auth.viewer, {
        recognition_consent,
        credentials,
        org_id: rest.org_id ?? null,
      }),
    }));

    return NextResponse.json(auditors);
  } catch (error: any) {
    console.error("Error fetching auditors:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Approve or Reject. Platform-admin only: the whole point of this gate is
// that recognition is adjudicated once, centrally, not per-org.
export async function POST(req: Request) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

  if (!auth.viewer.isPlatform) {
    return NextResponse.json(
      { error: "Only the platform admin may approve or reject an auditor." },
      { status: 403 },
    );
  }

  try {
    const { id, action, reason } = await req.json();

    if (!id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (action === "reject" && !String(reason ?? "").trim()) {
      return NextResponse.json(
        { error: "A rejection reason is required." },
        { status: 400 },
      );
    }

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
            data: {
              status: "rejected",
              rejection_reason: "Audit limit reached (3) — automatically rejected.",
              reviewed_at: new Date(),
            },
          });
          return NextResponse.json({
            success: false,
            message: "Auditor audit limit reached (3), automatically rejected",
          });
        }

        // Org binding no longer happens here — an approved auditor is
        // org-agnostic until an org admin selects them (org_auditor_selection).
        await prisma.pesuser.update({
          where: { id: existingAuditor.id },
          data: { audit_count: { increment: 1 } },
        });
      }

      // A new account is created with an unusable password and is reached
      // through a one-time set-password link, the same way storefront
      // provisioning onboards an org admin (`issuePasswordToken(..., 'setup')`).
      //
      // The previous version generated a password here and mailed it in clear
      // text. That put a working credential in an inbox indefinitely, where it
      // stays after the account is used, and it is the one path in this codebase
      // that did so — /api/password/request, /api/resetPassword and storefront
      // provisioning all issue links. `must_change_password` did force a change
      // on first login, but only after the mailed password had already let
      // whoever held it in.
      //
      // crypto.randomBytes rather than a human-typeable password: nobody is
      // meant to type this one, so it only has to be unguessable.
      const unusablePassword = randomBytes(32).toString("hex");

      if (!existingAuditor) {
        // New auditor, insert with audit_count = 1
        await prisma.pesuser.create({
          data: {
            name: a.name,
            email: a.email,
            password: await bcrypt.hash(unusablePassword, 10),
            must_change_password: true,
            gsm: a.gsm,
            role: "auditor",
            address: a.address,
            dob: a.dob,
            image: a.image,
            // No org_id — recognition is platform-level; an org binds to this
            // auditor only via org_auditor_selection, after they pick them.
            audit_count: 1,
          },
        });
      }

      await prisma.auditor_responses.update({
        where: { id },
        data: { status: "approved", reviewed_at: new Date() },
      });

      // Send success email. An existing auditor keeps their password, so only a
      // brand-new account gets a set-password link.
      let setupLink: string | null = null;
      let linkExpires: Date | null = null;
      if (!existingAuditor) {
        const created = await prisma.pesuser.findFirst({
          where: { email: a.email, role: "auditor" },
          select: { id: true },
        });
        if (created) {
          const issued = await issuePasswordToken(created.id, "setup");
          setupLink = passwordLink(issued.token, "setup", req.headers.get("origin"));
          linkExpires = issued.expiresAt;
        }
      }

      await transporter.sendMail({
        from: `"Audit System" <${process.env.EMAIL_USER}>`,
        to: a.email,
        subject: "Approval Notification",
        html: `
          <h2>Congratulations, ${escapeHtml(a.name)}!</h2>
          <p>Your application as an auditor has been approved.</p>
          ${
            existingAuditor
              ? `<p>You can now log in with your existing credentials.</p>`
              : setupLink
                ? `
          <p>Choose a password to activate your account:</p>
          <p><a href="${escapeHtml(setupLink)}">Set your password</a></p>
          <p>This link expires on ${escapeHtml(linkExpires!.toUTCString())}. If it
             expires, use "Forgot password" on the sign-in page with
             ${escapeHtml(a.email)}.</p>
          `
                : `
          <p>Your account is ready. Use "Forgot password" on the sign-in page with
             ${escapeHtml(a.email)} to choose a password.</p>
          `
          }
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
        data: {
          status: "rejected",
          rejection_reason: String(reason).trim(),
          reviewed_at: new Date(),
        },
      });
      return NextResponse.json({ success: true, message: "Auditor rejected" });
    }
  } catch (error: any) {
    console.error("Error approving auditor:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
