import { NextResponse } from "next/server";
import prisma from "../prisma.dev"; // or your db client
import { verifyToken } from "../_lib/authGuard";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let org;
    try {
      const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      org = decoded?.org;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!org) return NextResponse.json({ error: "Org missing in token" }, { status: 400 });

    const { pesuser_name } = await req.json();

    // Fetch user performance record
    const performance = await prisma.userperformance.findFirst({
      where: { pesuser_name, org },
      select: {
        competence: true,
        integrity: true,
        compatibility: true,
        use_of_resources: true,
        dept: true,
      },
    });

    // Fetch appraisal record
    const appraisal = await prisma.appraisal.findFirst({
      where: { pesuser_name, org },
      select: {
        teaching_quality_evaluation: true,
        research_quality_evaluation: true,
        administrative_quality_evaluation: true,
        community_quality_evaluation: true,
      },
    });

    return NextResponse.json({
      performance: performance || null,
      appraisal: appraisal || null,
    });
  } catch (error: any) {
    console.error("Error fetching performance/appraisal:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
