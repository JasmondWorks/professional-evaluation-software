export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../prisma.dev";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { tokenFromRequest } from "../../_lib/authGuard";
import { consoleViewer } from "../_scope";
import { generateUniquePassword } from "../../_lib/createEmployee";
import { escapeHtml } from "../../_lib/escapeHtml";

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Get all pending auditors
export async function GET(req: Request) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

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
  // Approving an auditor creates a pesuser and mails out credentials. It ran
  // unauthenticated, so anyone could mint an auditor account.
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

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
        select: { id: true, audit_count: true, org_id: true },
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

        // Increment audit_count if under limit, and adopt the inviting org if
        // the account has none yet (every auditor approved before org_id was
        // carried through). An account that already names an org is left
        // alone: pesuser holds a single org_id, so overwriting it would move
        // the auditor out of the first organization rather than add them to
        // the second. Serving several organizations at once needs a join
        // table and is not expressible on this column.
        await prisma.pesuser.update({
          where: { id: existingAuditor.id },
          data: {
            audit_count: { increment: 1 },
            ...(existingAuditor.org_id || !a.org_id ? {} : { org_id: a.org_id }),
          },
        });
      }

      // Random per-account password, same as every other provisioning path
      // (createEmployee.generateUniquePassword) — a hardcoded literal here
      // would give every new auditor account the same guessable password
      // until they changed it, and changing it was never enforced.
      const tempPassword = generateUniquePassword();

      if (!existingAuditor) {
        // New auditor, insert with audit_count = 1
        await prisma.pesuser.create({
          data: {
            name: a.name,
            email: a.email,
            password: await bcrypt.hash(tempPassword, 10),
            must_change_password: true,
            gsm: a.gsm,
            role: "auditor",
            address: a.address,
            dob: a.dob,
            image: a.image,
            // Carried from the submission, which reads it off the invite token.
            // This was omitted, so every approved auditor was created with
            // org_id NULL — and both /api/admin/all-auditors and
            // /api/admin/orgs/[orgId]/auditors filter on org_id, so an org
            // admin's auditor list came back empty for auditors they had
            // themselves invited.
            org_id: a.org_id,
            audit_count: 1,
          },
        });
      }

      // Update auditor_responses status
      await prisma.auditor_responses.update({
        where: { id },
        data: { status: "approved" },
      });

      // Send success email. An existing auditor's password is untouched by a
      // re-approval, so only a brand-new account gets credentials in the mail.
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
              : `
          <p>You can now log in using:</p>
          <ul>
            <li>Email: ${escapeHtml(a.email)}</li>
            <li>Password: ${escapeHtml(tempPassword)}</li>
          </ul>
          <p>You will be asked to choose your own password on first login.</p>
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
        data: { status: "rejected" },
      });
      return NextResponse.json({ success: true, message: "Auditor rejected" });
    }
  } catch (error: any) {
    console.error("Error approving auditor:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
