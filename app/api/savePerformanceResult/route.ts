import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";

export async function POST(req: NextRequest) {
  try {
    // Saving performance-metric results requires define_performance (or admin).
    const auth = authorize(tokenFromRequest(req), {
      roles: ["industrial-engineer"],
      anyOf: ["define_performance"],
    });
    if (!auth.ok) return auth.response;
    const org = auth.user.org;
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

    await prisma.performance_result.create({
      data: { org, total_score, rating, thresholds, criteria },
    });

    return NextResponse.json({ success: true, message: "Performance result saved" });
  } catch (err: any) {
    console.error("Error saving performance result:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
