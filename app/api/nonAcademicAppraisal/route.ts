import { NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";

export async function POST(req: Request) {
  try {
    // jwtDecode parses a token without checking its signature, so this org was
    // whatever the caller wrote into one.
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;

    const org = auth.user.org ? String(auth.user.org) : null;
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
