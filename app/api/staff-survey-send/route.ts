import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { subject, message, sender } = await req.json();

    // === 1. Create Gmail transporter ===
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // === 2. Construct email ===
    const mailOptions = {
      from: `"PES System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // Send to admin
      subject: subject || "New Notification from PES App",
      html: `
        <div style="font-family:Arial,sans-serif; padding:10px; background:#f8f9fa;">
          <h2 style="color:#0a66c2;">📩 PES System Alert</h2>
          <p><strong>Sender:</strong> ${sender || "System"}</p>
          <p><strong>Message:</strong></p>
          <p style="padding:10px; background:#fff; border:1px solid #ddd; border-radius:6px;">
            ${message}
          </p>
          <hr style="border:none; border-top:1px solid #eee; margin-top:20px;" />
          <small style="color:#777;">This message was sent automatically from your PES application.</small>
        </div>
      `,
    };

    // === 3. Send Email ===
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "✅ Email sent to admin successfully." });
  } catch (error: any) {
    console.error("❌ Email send error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
