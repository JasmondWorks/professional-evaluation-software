// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../prisma.dev";
import { sendMail } from "@/app/lib/email";
import { authorize, tokenFromRequest } from "../_lib/authGuard";
import { rateLimit } from "../_lib/rateLimit";
import { escapeHtml } from "../_lib/escapeHtml";
import { generateUniquePassword } from "../_lib/createEmployee";
import { issuePasswordToken, passwordLink } from "@/app/lib/auth/passwordToken";

// Invites an external auditor into the system for the first time. Only an
// organization admin can do this — they are the ones who source auditors and
// vouch for them locally; the platform admin's role is reviewing global
// recognition requests afterward (see /api/super/global-recognition), not
// inviting people in fresh.
//
// The account is created right here, not on approval: the auditor must set a
// password and log in BEFORE they can reach the onboarding questionnaire —
// answering it (and uploading documents) was previously possible with no
// account at all, gated only by a JWT embedded in the link.
export async function POST(request: Request) {
  const auth = authorize(tokenFromRequest(request), { roles: ["admin"] });
  if (!auth.ok) return auth.response;

  const tooMany = rateLimit(request, {
    key: "auditor-invite",
    limit: 20,
    windowMs: 60 * 60_000,
    subject: auth.user.org ? String(auth.user.org) : null,
  });
  if (tooMany) return tooMany;

  const orgId = auth.user.orgId;
  if (!orgId) {
    return NextResponse.json({ message: "Your account is not attached to an organization" }, { status: 400 });
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    // Someone with this email already has an account — inviting them again
    // would either collide with their existing login or, worse, let an org
    // admin walk an existing staff/admin account through the auditor
    // onboarding flow. Block it with a clear reason instead of silently
    // overwriting anything downstream.
    const existingUser = await prisma.pesuser.findUnique({
      where: { email },
      select: { role: true },
    });
    if (existingUser) {
      return NextResponse.json(
        {
          message:
            existingUser.role === "auditor"
              ? "This email already belongs to an auditor in the system. Use 'Browse Auditors' to add an existing one to your organization instead."
              : "This email already belongs to an existing user in the system.",
        },
        { status: 409 },
      );
    }

    // Placeholder password nobody is ever told: it is unusable until they
    // spend the setup token below and choose their own, same as any other
    // provisioned account in this app (see createEmployee.generateUniquePassword).
    const placeholderPassword = generateUniquePassword();
    const auditor = await prisma.pesuser.create({
      data: {
        // No name yet — the questionnaire collects it. The email local part
        // is a readable placeholder until then.
        name: email.split("@")[0],
        email,
        password: await bcrypt.hash(placeholderPassword, 10),
        must_change_password: true,
        // The org admin inviting them BY NAME is itself the authorization to
        // audit locally — there is no separate approval step, so this is the
        // real 'auditor' role from the moment the account is created, not a
        // lesser pending one. The onboarding questionnaire is still required
        // before they can do anything else (see AuditorOnboardingGate), but
        // that's a completeness gate, not a privilege one.
        role: "auditor",
        org_id: orgId,
      },
    });

    const { token, expiresAt } = await issuePasswordToken(auditor.id, "setup");
    const link = passwordLink(token, "setup");

    const { success, error } = await sendMail({
      to: email,
      subject: "Invitation: External Auditor for PES",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4F46E5; text-align: center;">You've been invited!</h2>
          <p>Hello,</p>
          <p>You have been invited to serve as an <strong>External Auditor</strong> for the Performance Evaluation System (PES). We value your expertise and look forward to your contributions.</p>
          <p>First, choose a password for your account. Once you're signed in, you'll be asked to complete a short questionnaire and upload any supporting documents.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${escapeHtml(link)}" style="background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Set your password</a>
          </div>

          <p style="font-size: 14px; color: #555;">If the button above isn't clickable, copy and paste the following link into your web browser:</p>
          <p style="font-size: 14px; word-break: break-all; color: #4F46E5; background: #f9f9f9; padding: 10px; border-radius: 4px;">
            ${escapeHtml(link)}
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">
            This link works once and expires on ${expiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. Please do not share it with anyone.<br/><br/>
            &copy; ${new Date().getFullYear()} Performance Evaluation System
          </p>
        </div>
      `,
    });

    // Only claim it was sent if the mailer says so. Reporting success for a send
    // that failed is how an invitation goes missing with nobody any the wiser —
    // and here it would also leave a dangling pesuser nobody can reach, so the
    // account is rolled back.
    if (!success) {
      console.error("Auditor invite failed to send:", email, error);
      await prisma.pesuser.delete({ where: { id: auditor.id } });
      return NextResponse.json(
        { message: error || "The invitation could not be sent." },
        { status: 502 },
      );
    }

    console.log("Auditor invite accepted by the mail provider:", email);
    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 },
    );
  }
}
