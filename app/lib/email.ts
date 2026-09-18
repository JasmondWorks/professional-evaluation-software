import nodemailer from "nodemailer";
import { Resend } from "resend";

/**
 * One email interface — sendMail({ to, subject, html }) — with two transports:
 *
 *   • Resend (preferred) — set RESEND_API_KEY. Send from a VERIFIED domain via
 *     EMAIL_FROM (e.g. "PES <noreply@yourdomain.com>"), or "onboarding@resend.dev"
 *     for quick testing. Handles deliverability, bounces, retries.
 *
 *   • SMTP fallback — used when RESEND_API_KEY is not set. Driven by
 *     EMAIL_HOST/PORT/USER/PASS (Gmail app password; spaces stripped).
 *
 * Nothing else in the app changes — callers only ever use sendMail().
 */
const FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER || "onboarding@resend.dev";

// --- Resend (preferred when configured) ---
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// --- SMTP fallback ---
const HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const PORT = Number(process.env.EMAIL_PORT || 587);
const USER = process.env.EMAIL_USER;
const PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");
const smtpTransporter =
  USER && PASS
    ? nodemailer.createTransport({
        host: HOST,
        port: PORT,
        secure: PORT === 465, // 465 → SSL, otherwise (587) → STARTTLS
        auth: { user: USER, pass: PASS },
      })
    : null;

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  const to = opts.to.trim();

  // 1) Resend
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM,
        to,
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
      });
      if (error) {
        console.error("[email:resend] error:", error);
        return { success: false, error: error.message };
      }
      void data;
      return { success: true };
    } catch (e) {
      console.error("[email:resend] threw:", e);
      return { success: false, error: e instanceof Error ? e.message : "Resend send failed" };
    }
  }

  // 2) SMTP fallback
  if (smtpTransporter) {
    try {
      await smtpTransporter.sendMail({
        from: FROM,
        to,
        subject: opts.subject,
        html: opts.html,
        replyTo: opts.replyTo,
      });
      return { success: true };
    } catch (e) {
      console.error("[email:smtp] failed:", e);
      return { success: false, error: e instanceof Error ? e.message : "SMTP send failed" };
    }
  }

  console.warn("[email] No transport configured (set RESEND_API_KEY or EMAIL_USER/EMAIL_PASS).");
  return { success: false, error: "Email not configured" };
}
