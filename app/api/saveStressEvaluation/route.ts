// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { verifyToken } from "../_lib/authGuard";
import { recordFeelingAndTransition } from "../../lib/stress/sessions";
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const org = decoded?.org;
    if (!org) {
      return NextResponse.json({ error: "Missing org in token" }, { status: 400 });
    }

    const body = await req.json();
    const { stress, pressure, conflict, anovaResult } = body;

    const cycle = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
    });

    if (!cycle) {
      return NextResponse.json({ error: "No active cycle found" }, { status: 400 });
    }

    // Record the feeling verdict vs F1 (the ±5% rule) which drives the reset.
    // The feeling side goes to FeelingResult (written by the service), while the
    // stress side (ANOVA) goes to stress_analysis_results below.
    const feelingTransition = await recordFeelingAndTransition(prisma, {
      org,
      cycleId: cycle.id,
      sessionId: cycle.session_id,
      iteration: cycle.iteration,
      feelingMean: Number(stress),
      createdBy: decoded?.userID ? String(decoded.userID) : undefined,
    });
    const needsReset = feelingTransition.triggeredReset;

    let record = null;
    if (anovaResult) {
      record = await prisma.stress_analysis_results.create({
        data: {
          org,
          cycle_id: cycle.id,
          session_id: feelingTransition.sessionId,
          f_statistic: anovaResult.fStatistic ? Number(anovaResult.fStatistic) : null,
          critical_value: anovaResult.criticalValue ? Number(anovaResult.criticalValue) : null,
          conclusion: anovaResult.conclusion || null,
        },
      });
    }

    if (cycle.phase !== "evaluated") {
      await prisma.stressCycle.update({
        where: { id: cycle.id },
        data: { phase: "evaluated", needs_reset: needsReset },
      });
    }

    return NextResponse.json({ success: true, record, needsReset, feelingTransition }, { status: 201 });
  } catch (err: any) {
    console.error("Error saving stress evaluation:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
