import { NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: Request) {
  try {
    const { pesuser_name } = await req.json();
    let whereClause = "";
    if (pesuser_name) whereClause = `WHERE pesuser_name = '${pesuser_name.replace(/'/g, "''")}'`;
    const results = await prisma.$queryRawUnsafe<any[]>(`
      SELECT pesuser_name, dept, teaching_quality_evaluation, research_quality_evaluation,
             administrative_quality_evaluation, community_quality_evaluation
      FROM appraisal ${whereClause};
    `);
    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching appraisal data:", err);
    return NextResponse.json({ error: "Failed to fetch appraisal" }, { status: 500 });
  }
}
