import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { email, origin } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const secret =
      process.env.JWT_SECRET || "fallback-secret-change-in-production";
    const token = jwt.sign({ email }, secret, { expiresIn: "7d" });
    // Prefer the caller's origin — NEXT_PUBLIC_APP_URL is empty in production,
    // which previously produced dead localhost invite links.
    const BASE_URL =
      origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const secureLink = `${BASE_URL}/auditor/${token}`;

    // Simulate sending an email (replace this with your email-sending logic)

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Invitation: External Auditor for PES",
      text: `You have been invited to serve as an External Auditor for PES. Please copy and paste this link into your browser to accept the invitation: ${secureLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4F46E5; text-align: center;">You've been invited!</h2>
          <p>Hello,</p>
          <p>You have been invited to serve as an <strong>External Auditor</strong> for the Performance Evaluation System (PES). We value your expertise and look forward to your contributions.</p>
          <p>Please click the button below to securely accept the invitation and access the platform:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${secureLink}" style="background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
          </div>
          
          <p style="font-size: 14px; color: #555;">If the button above isn't clickable, copy and paste the following link into your web browser:</p>
          <p style="font-size: 14px; word-break: break-all; color: #4F46E5; background: #f9f9f9; padding: 10px; border-radius: 4px;">
            ${secureLink}
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">
            This link is securely generated and will expire in 7 days for your protection. Please do not share it with anyone.<br/><br/>
            &copy; ${new Date().getFullYear()} Performance Evaluation System
          </p>
        </div>
      `,
    });
    // Example: Use a service like Nodemailer, SendGrid, or AWS SES to send the email
    // await sendEmailFunction(email, secureLink);

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
