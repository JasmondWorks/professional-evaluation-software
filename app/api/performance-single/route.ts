import { NextResponse } from "next/server";
import prisma from "../prisma.dev"; // or your db client

export async function POST(req: Request) {
  try {
    const { pesuser_name, org } = await req.json();

    // Fetch user performance record
    const performance: any[] = await prisma.$queryRawUnsafe(`
      SELECT competence, integrity, compatibility, use_of_resources, dept
      FROM userperformance
      WHERE pesuser_name = '${pesuser_name}' AND org = '${org}'
      LIMIT 1;
    `);

    // Fetch appraisal record
    const appraisal: any[] = await prisma.$queryRawUnsafe(`
      SELECT teaching_quality_evaluation, research_quality_evaluation,
             administrative_quality_evaluation, community_quality_evaluation
      FROM appraisal
      WHERE pesuser_name = '${pesuser_name}' AND org = '${org}'
      LIMIT 1;
    `);
    console.log("Appraisal fetched successfully", appraisal);

    return NextResponse.json({
      performance: performance[0] || null,
      appraisal: appraisal[0] || null,
    });
  } catch (error: any) {
    console.error("Error fetching performance/appraisal:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
