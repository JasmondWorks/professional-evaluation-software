import { NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: Request) {
  try {
    const { pesuser_name } = await req.json();
    const results = await prisma.counter_appraisal.findMany({
      where: pesuser_name ? { pesuser_name } : undefined,
      select: {
        pesuser_name: true,
        dept: true,
        teaching_quality_evaluation: true,
        research_quality_evaluation: true,
        administrative_quality_evaluation: true,
        community_quality_evaluation: true,
      },
    });
    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching counter appraisal:", err);
    return NextResponse.json({ error: "Failed to fetch counter appraisal" }, { status: 500 });
  }
}
