// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { verifyToken } from "../_lib/authGuard";

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

    const rawBody = await req.json();
    const body = {
      ...rawBody,
      shared: rawBody.shared || {},
      staffAppraisalResult: rawBody.staffAppraisalResult || {},
      unitOverloadingResult: rawBody.unitOverloadingResult || {},
      bossLostResult: rawBody.bossLostResult || {},
    };

    const {
      shared,
      OQ,
      WQ,
      points,
      RTP,
      staffAppraisalResult,
      Na,
      Ta,
      unitOverloadingResult,
      Pidle,
      bossLostResult,
      totalWastedCost,
    } = body;

    // Normalise empty/undefined values to null, everything else to a number.
    const num = (val: any) =>
      val === undefined || val === null || val === "" ? null : Number(val);

    const record = await prisma.staff_appraisal_results.create({
      data: {
        org,
        cwh: num(shared?.Cwh),
        cbh: num(shared?.Cbh),
        hd: num(shared?.Hd),
        oq: num(OQ),
        wq: num(WQ),
        points: num(points),
        rtp: num(RTP),
        computed_appraisal_max_score: num(staffAppraisalResult?.computedAppraisalMaxScore),
        hod_max_score: num(staffAppraisalResult?.hodMaxScore),
        na: num(Na),
        ta: num(Ta),
        wasted_man_hours: num(unitOverloadingResult?.wastedManHours),
        wasted_cost: num(unitOverloadingResult?.wastedCost),
        pidle: num(Pidle),
        lost_hours: num(bossLostResult?.Lh),
        lost_cost: num(bossLostResult?.cost),
        total_wasted_cost: num(totalWastedCost),
      },
    });
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (err: any) {
    console.error("Error saving appraisal:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
