import { NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { jwtDecode } from "jwt-decode";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = jwtDecode(token);
    const org = decoded?.org;
    if (!org)
      return NextResponse.json({ error: "Missing org in token" }, { status: 400 });

    const body = await req.json();
    const { metrics, weights, thresholds, totalScore, rating } = body;

    // Check if record exists
    const existing: any = await prisma.$queryRawUnsafe(
      `SELECT id FROM non_academic_appraisal WHERE org = $1 LIMIT 1`,
      org
    );

    if (existing.length > 0) {
      // Update existing record
      await prisma.$queryRawUnsafe(
        `
        UPDATE non_academic_appraisal
        SET output = $1,
            quality = $2,
            efficiency = $3,
            attendance = $4,
            teamwork = $5,
            total_score = $6,
            rating = $7,
            thresholds = $8::jsonb,
            weights = $9::jsonb,
            updated_at = NOW()
        WHERE org = $10
      `,
        metrics.output,
        metrics.quality,
        metrics.efficiency,
        metrics.attendance,
        metrics.teamwork,
        totalScore,
        rating,
        JSON.stringify(thresholds),
        JSON.stringify(weights),
        org
      );
    } else {
      // Insert new record
      await prisma.$queryRawUnsafe(
        `
        INSERT INTO non_academic_appraisal (
          org, output, quality, efficiency, attendance, teamwork,
          total_score, rating, thresholds, weights, created_at, updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,NOW(),NOW())
      `,
        org,
        metrics.output,
        metrics.quality,
        metrics.efficiency,
        metrics.attendance,
        metrics.teamwork,
        totalScore,
        rating,
        JSON.stringify(thresholds),
        JSON.stringify(weights)
      );
    }

    return NextResponse.json({ success: true, message: "Appraisal saved successfully." });
  } catch (err: any) {
    console.error("Error saving non-academic appraisal:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
