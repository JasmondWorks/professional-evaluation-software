export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../_lib/authGuard";
import { staffPerformance } from "@/app/lib/performance/results";

// Performance scores for a department (used by the Assessment integrity test).
//
// Reads the performance model rather than the old flat `userperformance` table,
// so the four criteria here are the settled figures — the head's objection and
// the auditor's ruling included — normalised to 100.
//
// Now org-scoped. It previously took a `dept` from the query string and returned
// every matching row in the database, so one organization's department name
// returned another organization's scores.
export async function GET(req: NextRequest) {
  const dept = new URL(req.url).searchParams.get("dept");
  if (!dept) {
    return NextResponse.json({ error: "Missing dept parameter" }, { status: 400 });
  }

  const token = req.headers.get("authorization")?.split(" ")[1];
  const decoded = token ? (verifyToken(token) as any) : null;
  if (!decoded?.org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await staffPerformance({ org: decoded.org, dept });

    return NextResponse.json(
      rows.map((r) => ({
        pesuser_name: r.pesuser_name,
        dept: r.dept,
        competence: r.competence,
        integrity: r.integrity,
        compatibility: r.compatibility,
        use_of_resources: r.use_of_resources,
        overall: r.overall,
        grade: r.grade,
      })),
    );
  } catch (err) {
    console.error("Error fetching performance by dept:", err);
    return NextResponse.json({ error: "Failed to fetch performance data" }, { status: 500 });
  }
}
