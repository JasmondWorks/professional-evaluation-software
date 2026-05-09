import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { jwtDecode } from "jwt-decode";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const decoded: any = jwtDecode(token);
    const org = decoded?.org;
    if (!org) {
      return NextResponse.json({ error: "Missing org in token" }, { status: 400 });
    }

    const body = await req.json();
    const { total_score, rating, thresholds, criteria } = body;

    if (
      total_score === undefined ||
      !rating ||
      !thresholds ||
      !criteria
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for existing record
    const existing: any = await prisma.$queryRaw`
      SELECT id FROM performance_result WHERE org = ${org}
    `;

    if (existing.length > 0) {
      // Update
      await prisma.$queryRaw`
        UPDATE performance_result
        SET total_score = ${total_score},
            rating = ${rating},
            thresholds = ${JSON.stringify(thresholds)},
            criteria = ${JSON.stringify(criteria)},
            updated_at = NOW()
        WHERE org = ${org}
      `;
    } else {
      // Insert
      await prisma.$queryRaw`
        INSERT INTO performance_result (org, total_score, rating, thresholds, criteria)
        VALUES (${org}, ${total_score}, ${rating}, ${JSON.stringify(thresholds)}, ${JSON.stringify(criteria)})
      `;
    }

    return NextResponse.json({ success: true, message: "Performance result saved" });
  } catch (err: any) {
    console.error("Error saving performance result:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
