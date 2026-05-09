import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email, link } = await request.json();

    if (!email || !link) {
      return NextResponse.json({ message: "Email and link are required" }, { status: 400 });
    }

    // Simulate sending an email (replace this with your email-sending logic)

    const transporter = nodemailer.createTransport({
      service: "Gmail", // or another email service
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Auditor Invitation",
      text: `You have been invited as an auditor to PES. Click the link to proceed: ${link}`,
    });
    // Example: Use a service like Nodemailer, SendGrid, or AWS SES to send the email
    // await sendEmailFunction(email, link);

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
  }
}