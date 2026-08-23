import { NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { verifyToken } from "../_lib/authGuard";
import { onePerformance } from "@/app/lib/performance/results";

// One staff member's performance and appraisal, for their own results page.
//
// Performance now comes from the performance model: the four criteria as
// settled, plus the overall and its RTP grading against the target. The old
// version returned the raw `userperformance` row, which had no overall and no
// grade, so the page graded it with its own invented thresholds.
export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const org = decoded?.org;
    if (!org) return NextResponse.json({ error: "Org missing in token" }, { status: 400 });

    const { pesuser_name } = await req.json();

    // A staff member may only pull their own record. This used to accept any
    // name in the org, so anyone could read a colleague's scores.
    const isPrivileged = ["super-admin", "admin", "hod", "unit-head"].includes(decoded.role);
    const name = isPrivileged && pesuser_name ? pesuser_name : decoded.name;

    const performance = await onePerformance(org, name);

    const appraisal = await prisma.appraisal.findFirst({
      where: { pesuser_name: name, org },
      select: {
        teaching_quality_evaluation: true,
        research_quality_evaluation: true,
        administrative_quality_evaluation: true,
        community_quality_evaluation: true,
      },
    });

    return NextResponse.json({ performance, appraisal: appraisal || null });
  } catch (error: any) {
    console.error("Error fetching performance/appraisal:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
