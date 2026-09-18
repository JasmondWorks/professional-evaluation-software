// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendMail } from "@/app/lib/email";
import { getJWTSecret } from "@/app/lib/jwt";
import { authorize, tokenFromRequest } from "../_lib/authGuard";
import { rateLimit } from "../_lib/rateLimit";
import { escapeHtml } from "../_lib/escapeHtml";

// Invites an external auditor. It had no auth, so it was an open relay: anyone
// could make the organization's mail account send an arbitrary address a link
// that grants auditor entry.
export async function POST(request: Request) {
  const auth = authorize(tokenFromRequest(request), { roles: ["super-admin", "admin"] });
  if (!auth.ok) return auth.response;

  const tooMany = rateLimit(request, {
    key: "auditor-invite",
    limit: 20,
    windowMs: 60 * 60_000,
    subject: auth.user.org ? String(auth.user.org) : null,
  });
  if (tooMany) return tooMany;

  try {
    const { email, origin } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    // The invite carries the inviting org, so accepting it lands the auditor in
    // the right tenant rather than wherever the accept form happens to say.
    const token = jwt.sign({ email, orgId: auth.user.orgId, org: auth.user.org }, getJWTSecret(), {
      expiresIn: "7d",
    });
    // Prefer the caller's origin — NEXT_PUBLIC_APP_URL is empty in production,
    // which previously produced dead localhost invite links. The caller is an
    // admin, not the public, but `origin` still shouldn't be trusted enough to
    // drop unvalidated into an href: an admin account handing out a malformed
    // value (or a compromised admin session) shouldn't be able to turn this
    // into an arbitrary link mailed from the app's own address.
    const fallbackBase = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let baseUrl = fallbackBase;
    if (typeof origin === "string" && origin) {
      try {
        const parsed = new URL(origin);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          baseUrl = parsed.origin;
        }
      } catch {
        // Malformed origin — fall back rather than embed it unvalidated.
      }
    }
    const secureLink = `${baseUrl}/auditor/${token}`;

    // This built its own transport with smtp.gmail.com:465 hardcoded, ignoring
    // EMAIL_HOST, EMAIL_PORT and the Resend path that every other email in the
    // app goes through. sendMail() is the one mailer.
    const { success, error } = await sendMail({
      to: email,
      subject: "Invitation: External Auditor for PES",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4F46E5; text-align: center;">You've been invited!</h2>
          <p>Hello,</p>
          <p>You have been invited to serve as an <strong>External Auditor</strong> for the Performance Evaluation System (PES). We value your expertise and look forward to your contributions.</p>
          <p>Please click the button below to securely accept the invitation and access the platform:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${escapeHtml(secureLink)}" style="background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
          </div>

          <p style="font-size: 14px; color: #555;">If the button above isn't clickable, copy and paste the following link into your web browser:</p>
          <p style="font-size: 14px; word-break: break-all; color: #4F46E5; background: #f9f9f9; padding: 10px; border-radius: 4px;">
            ${escapeHtml(secureLink)}
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">
            This link is securely generated and will expire in 7 days for your protection. Please do not share it with anyone.<br/><br/>
            &copy; ${new Date().getFullYear()} Performance Evaluation System
          </p>
        </div>
      `,
    });

    // Only claim it was sent if the mailer says so. Reporting success for a send
    // that failed is how an invitation goes missing with nobody any the wiser.
    if (!success) {
      console.error("Auditor invite failed to send:", email, error);
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
