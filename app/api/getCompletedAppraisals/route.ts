export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { jwtDecode } from "jwt-decode";

// Completed appraisals for the caller's org (pending = false) — the "View All"
// target for the dashboard's "Completed Appraisals" card.
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwtDecode(token);
    const org = decoded?.org;
    if (!org) {
      return NextResponse.json({ error: "Missing org in token" }, { status: 400 });
    }

    const appraisals = await prisma.appraisal.findMany({
      where: { org, pending: false },
      select: {
        id: true,
        pesuser_name: true,
        dept: true,
        teaching_quality_evaluation: true,
        research_quality_evaluation: true,
        administrative_quality_evaluation: true,
        community_quality_evaluation: true,
      },
      orderBy: { pesuser_name: "asc" },
    });

    return NextResponse.json(appraisals);
  } catch (err) {
    console.error("Error fetching completed appraisals:", err);
    return NextResponse.json(
      { error: "Failed to fetch completed appraisals" },
      { status: 500 },
    );
  }
}
