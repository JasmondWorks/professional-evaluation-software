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

    const fields = {
      output: metrics.output,
      quality: metrics.quality,
      efficiency: metrics.efficiency,
      attendance: metrics.attendance,
      teamwork: metrics.teamwork,
      total_score: totalScore,
      rating,
      thresholds,
      weights,
    };

    await prisma.non_academic_appraisal.create({
      data: { org, ...fields },
    });

    return NextResponse.json({ success: true, message: "Appraisal saved successfully." });
  } catch (err: any) {
    console.error("Error saving non-academic appraisal:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
