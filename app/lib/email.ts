import nodemailer, { Transporter } from "nodemailer";

/**
 * Standard SMTP config from env. Works for Gmail on 587 (STARTTLS) or 465 (SSL).
 *   EMAIL_HOST  (default smtp.gmail.com)
 *   EMAIL_PORT  (default 587)
 *   EMAIL_USER  the SMTP login
 *   EMAIL_PASS  the app password (Gmail shows it with spaces — we strip them)
 *   EMAIL_FROM  the From address (defaults to EMAIL_USER)
 * (Legacy SMTP_HOST/SMTP_PORT are still honoured as fallbacks.)
 */
const HOST = process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
const PORT = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || "587", 10);
const USER = process.env.EMAIL_USER;
// Gmail app passwords are displayed in 4-char groups with spaces; strip them.
const PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");
export const EMAIL_FROM = process.env.EMAIL_FROM || USER;

// One shared, reused transporter (don't create/verify one per email).
let cachedTransporter: Transporter | null = null;
function getTransporter(): Transporter | null {
  if (!USER || !PASS) {
    console.warn("⚠️  Email not configured. Set EMAIL_USER and EMAIL_PASS in .env");
    return null;
  }
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465, // 465 = implicit SSL; 587 = STARTTLS
      requireTLS: PORT !== 465,
      auth: { user: USER, pass: PASS },
    });
  }
  return cachedTransporter;
}

/**
 * Generic send. The one place that talks to SMTP.
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.log("📧 Email (not configured) →", opts.to, "|", opts.subject);
    }
    return { success: false, error: "Email service not configured" };
  }
  try {
    const to = opts.to.trim().replace(/[\r\n,;]/g, "");
    await transporter.sendMail({
      from: `"PES" <${EMAIL_FROM}>`,
      to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to send email" };
  }
}

/** Back-compat shim for the template-based sender below. */
function createTransporter() {
  return getTransporter();
}

/**
 * Email templates
 */
const templates = {
  passwordReset: (resetLink: string, userName: string) => ({
    subject: "Password Reset Request - PES",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>We received a request to reset your password for your PES account.</p>
            <p>Click the button below to reset your password:</p>
            <Link href="${resetLink}" class="button">Reset Password</Link>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${resetLink}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PES - Performance Evaluation System</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${userName},
      
      We received a request to reset your password for your PES account.
      
      Click this link to reset your password: ${resetLink}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, you can safely ignore this email.
      
      © ${new Date().getFullYear()} PES - Performance Evaluation System
    `,
  }),

  passwordChanged: (userName: string) => ({
    subject: "Password Changed Successfully - PES",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Your password has been changed successfully.</p>
            <p>If you didn't make this change, please contact support immediately.</p>
            <p>For security reasons, you may need to log in again on all your devices.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PES - Performance Evaluation System</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${userName},
      
      Your password has been changed successfully.
      
      If you didn't make this change, please contact support immediately.
      
      © ${new Date().getFullYear()} PES - Performance Evaluation System
    `,
  }),

  welcomeEmail: (userName: string, email: string, tempPassword: string) => ({
    subject: "Welcome to PES - Your Account Details",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .credentials { background: white; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to PES!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Your account has been created successfully. Here are your login credentials:</p>
            <div class="credentials">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            <p><strong>⚠️ Important:</strong> Please change your password after your first login.</p>
            <p>You can log in at: ${process.env.NEXT_PUBLIC_APP_URL}/login</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PES - Performance Evaluation System</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${userName},
      
      Your account has been created successfully.
      
      Email: ${email}
      Temporary Password: ${tempPassword}
      
      ⚠️ Important: Please change your password after your first login.
      
      Login at: ${process.env.NEXT_PUBLIC_APP_URL}/login
      
      © ${new Date().getFullYear()} PES - Performance Evaluation System
    `,
  }),
};

/**
 * Send email
 */
export async function sendEmail(
  to: string,
  template: keyof typeof templates,
  data: any,
): Promise<{ success: boolean; error?: string }> {
  const transporter = createTransporter();

  if (!transporter) {
    // In development, log email instead of sending
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Email (Development Mode):");
      console.log("To:", to);
      console.log("Template:", template);
      console.log("Data:", data);
      const emailContent = (templates as any)[template](...Object.values(data));
      console.log("Subject:", emailContent.subject);
      console.log("Text:", emailContent.text);
      return { success: true };
    }
    return { success: false, error: "Email service not configured" };
  }

  try {
    const emailContent = (templates as any)[template](...Object.values(data));

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  resetToken: string,
): Promise<{ success: boolean; error?: string }> {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  return sendEmail(email, "passwordReset", { resetLink, userName });
}

/**
 * Send password changed confirmation email
 */
export async function sendPasswordChangedEmail(
  email: string,
  userName: string,
): Promise<{ success: boolean; error?: string }> {
  return sendEmail(email, "passwordChanged", { userName });
}

/**
 * Send welcome email with credentials
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string,
  tempPassword: string,
): Promise<{ success: boolean; error?: string }> {
  return sendEmail(email, "welcomeEmail", { userName, email, tempPassword });
}
