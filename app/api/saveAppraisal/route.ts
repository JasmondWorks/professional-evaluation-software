import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: NextRequest) {
  try {
    // ✅ Clone the request to prevent the stream from being locked
    const clonedReq = req.clone();
    const body = await clonedReq.json();

    const { pesuser_name, org, isCounter = false, isAuditor = false, ...payload } = body;

    if (!pesuser_name || !org || Object.keys(payload).length === 0) {
      return NextResponse.json(
        { message: "Missing required fields or empty payload" },
        { status: 400 }
      );
    }

    // Fetch dept from pesuser
    const userResult = await prisma.$queryRawUnsafe<{ dept: string }[]>(
      `SELECT dept FROM "pesuser" WHERE name = $1 AND org = $2 LIMIT 1`,
      pesuser_name,
      org
    );

    if (userResult.length === 0 || !userResult[0].dept) {
      return NextResponse.json(
        { message: "User not found or department missing" },
        { status: 404 }
      );
    }

    const dept = userResult[0].dept;
    const targetTable = isCounter || !isAuditor ? "counter_appraisal" : "appraisal";

    // Build query
    const columns = Object.keys(payload).map((c) => `"${c}"`).join(", ");
    const placeholders = Object.keys(payload).map((_, i) => `$${i + 4}`).join(", ");
    const values = Object.values(payload);

    console.log(columns, placeholders, values);

    const updates = Object.keys(payload)
      .map((c) => `"${c}" = EXCLUDED."${c}"`)
      .join(", ");

    // This ensures replace behavior on every insert
    const query = `
      INSERT INTO "${targetTable}" (pesuser_name, org, dept, ${columns})
      VALUES ($1, $2, $3, ${placeholders})
      ON CONFLICT (pesuser_name, org, dept)
      DO UPDATE SET ${updates};
    `;

    await prisma.$executeRawUnsafe(query, pesuser_name, org, dept, ...values);

    return NextResponse.json(
      { message: `${isCounter ? "Counter" : "Main"} appraisal saved (replaced if existed)` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Prisma query error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
