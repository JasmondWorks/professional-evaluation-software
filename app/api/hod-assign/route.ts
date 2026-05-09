import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import nodemailer from "nodemailer";

type PesUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  org: string;
};

async function assignUsersToHods() {
  // -------------------------
  // 1. Get all HODs
  // -------------------------
  const hods = await prisma.$queryRaw<PesUser[]>`
    SELECT * FROM pesuser WHERE role = 'hod'
  `;

  if (hods.length === 0) return { message: "No HODs found", status: 404 };
  if (hods.length > 0 && hods.length < 15) return { message: "Not enough HODs found", status: 400 };

  // -------------------------
  // 2. Get all non-HOD users
  // -------------------------
  const users = await prisma.$queryRaw<PesUser[]>`
    SELECT * FROM pesuser WHERE role != 'hod'
  `;

  // -------------------------
  // 3. Assign 15 users per HOD
  // -------------------------
  for (const hod of hods) {
    const shuffled = users.sort(() => 0.5 - Math.random());
    const assignedUsers = shuffled.slice(0, 15);

    for (const user of assignedUsers) {
      // Insert into mapping table
      await prisma.$queryRawUnsafe(
        `INSERT INTO hod_assignments (hod_id, user_id) VALUES ($1, $2)
         ON CONFLICT (hod_id, user_id) DO NOTHING`,
        hod.id,
        user.id
      );

      // -------------------------
      // 4. Send email
      // -------------------------
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: "New Data Entry Assignment",
        html: `<p>Hello ${user.name},</p>
               <p>You have been assigned to HOD <strong>${hod.name}</strong> for data entry.</p>
               <p>Click <a href="https://yourdomain.com/data-entry/hod/${hod.id}">here</a> to start entering data.</p>`,
      };

      await transporter.sendMail(mailOptions);
    }
  }

  await prisma.$disconnect();
  return { message: "Assignments complete", status: 200 };
}

export async function POST(req: NextRequest) {
  try {
    const result = await assignUsersToHods();
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to assign users to HODs" }, { status: 500 });
  }
}
