import nodemailer from "nodemailer";

/**
 * Standard SMTP mailer — one transporter, one send function.
 *
 * Configure via env (matches a normal Gmail app-password setup):
 *   EMAIL_HOST   default "smtp.gmail.com"
 *   EMAIL_PORT   default 587 (STARTTLS). 465 = implicit SSL.
 *   EMAIL_USER   the SMTP login (the Gmail address)
 *   EMAIL_PASS   the 16-char app password (Gmail shows it with spaces; we strip them)
 *   EMAIL_FROM   the From address (defaults to EMAIL_USER)
 */
const HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const PORT = Number(process.env.EMAIL_PORT || 587);
const USER = process.env.EMAIL_USER;
const PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");
const FROM = process.env.EMAIL_FROM || USER;

// Created once at module load. createTransport does not open a connection until
// the first send, so this is cheap and safe to keep module-level.
const transporter = nodemailer.createTransport({
  host: HOST,
  port: PORT,
  secure: PORT === 465, // 465 → SSL, otherwise (587) → STARTTLS
  auth: { user: USER, pass: PASS },
});

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!USER || !PASS) {
    console.warn("[email] EMAIL_USER / EMAIL_PASS not set — cannot send email.");
    return { success: false, error: "Email not configured" };
  }
  try {
    const to = opts.to.trim();
    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    console.log(
      `[email] sent to=${to} id=${info.messageId} accepted=${JSON.stringify(info.accepted)} rejected=${JSON.stringify(info.rejected)}`,
    );
    return { success: true };
  } catch (error) {
    console.error("[email] send failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to send email" };
  }
}
