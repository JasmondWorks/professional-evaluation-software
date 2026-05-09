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

    const safe = (val: any, isString = false) => {
      if (val === undefined || val === null || val === "") return "NULL";
      return isString ? `'${val}'` : val;
    };

    const sql = `
      INSERT INTO staff_appraisal_results (
        org,
        cwh,
        cbh,
        hd,
        oq,
        wq,
        points,
        rtp,
        computed_appraisal_max_score,
        hod_max_score,
        na,
        ta,
        wasted_man_hours,
        wasted_cost,
        pidle,
        lost_hours,
        lost_cost,
        total_wasted_cost
      )
      VALUES (
        ${safe(org, true)},
        ${safe(shared?.Cwh)},
        ${safe(shared?.Cbh)},
        ${safe(shared?.Hd)},
        ${safe(OQ)},
        ${safe(WQ)},
        ${safe(points)},
        ${safe(RTP)},
        ${safe(staffAppraisalResult?.computedAppraisalMaxScore)},
        ${safe(staffAppraisalResult?.hodMaxScore)},
        ${safe(Na)},
        ${safe(Ta)},
        ${safe(unitOverloadingResult?.wastedManHours)},
        ${safe(unitOverloadingResult?.wastedCost)},
        ${safe(Pidle)},
        ${safe(bossLostResult?.Lh)},
        ${safe(bossLostResult?.cost)},
        ${safe(totalWastedCost)}
      )
      RETURNING *;
    `;

    const [record]: any = await prisma.$queryRawUnsafe(sql);
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (err: any) {
    console.error("Error saving appraisal:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
