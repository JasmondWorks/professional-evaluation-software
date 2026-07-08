import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import nodemailer from "nodemailer";

async function assignUsersToHods() {
  // -------------------------
  // 1. Get all HODs
  // -------------------------
  const hods = await prisma.pesuser.findMany({ where: { role: "hod" } });

  if (hods.length === 0) return { message: "No HODs found", status: 404 };
  if (hods.length > 0 && hods.length < 15)
    return { message: "Not enough HODs found", status: 400 };

  // -------------------------
  // 2. Get all non-HOD users
  // -------------------------
  const users = await prisma.pesuser.findMany({
    where: { role: { not: "hod" } },
  });

  // -------------------------
  // 3. Assign 15 users per HOD
  // -------------------------
  for (const hod of hods) {
    const shuffled = users.sort(() => 0.5 - Math.random());
    const assignedUsers = shuffled.slice(0, 15);

    for (const user of assignedUsers) {
      // Insert into mapping table (ON CONFLICT DO NOTHING → skipDuplicates)
      await prisma.hod_assignments.createMany({
        data: [{ hod_id: hod.id, user_id: user.id }],
        skipDuplicates: true,
      });

      // -------------------------
      // 4. Send email
      // -------------------------
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "New Data Entry Assignment",
        html: `<p>Hello ${user.name},</p>
               <p>You have been assigned to HOD <strong>${hod.name}</strong> for data entry.</p>
               <p>Click <Link href="https://yourdomain.com/data-entry/hod/${hod.id}">here</Link> to start entering data.</p>`,
      };

      await transporter.sendMail(mailOptions);
    }
  }

  return { message: "Assignments complete", status: 200 };
}

export async function POST(req: NextRequest) {
  try {
    const result = await assignUsersToHods();
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to assign users to HODs" },
      { status: 500 },
    );
  }
}
