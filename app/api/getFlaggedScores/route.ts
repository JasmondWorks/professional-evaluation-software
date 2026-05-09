import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: NextRequest) {
  try {
    const { org } = await req.json();

    let whereClause = "WHERE pending = TRUE";
    if (org) {
      // escape quotes to prevent SQL injection
      whereClause += ` AND org = '${org.replace(/'/g, "''")}'`;
    }

    // --- Appraisals (main + counter) ---
    const appraisals = await prisma.$queryRawUnsafe<any[]>(`
      SELECT pesuser_name, dept,
             teaching_quality_evaluation, research_quality_evaluation,
             administrative_quality_evaluation, community_quality_evaluation,
             'main' AS source
      FROM appraisal
      ${whereClause}
      UNION ALL
      SELECT pesuser_name, dept,
             teaching_quality_evaluation, research_quality_evaluation,
             administrative_quality_evaluation, community_quality_evaluation,
             'counter' AS source
      FROM counter_appraisal
      ${whereClause}
    `);

    // --- Performance (main + counter) ---
    const performances = await prisma.$queryRawUnsafe<any[]>(`
      SELECT pesuser_name, dept,
             competence, integrity, compatibility, use_of_resources,
             'main' AS source
      FROM userperformance
      ${whereClause}
      UNION ALL
      SELECT pesuser_name, dept,
             competence, integrity, compatibility, use_of_resources,
             'counter' AS source
      FROM counter_userperformance
      ${whereClause}
    `);

    // --- Helper to group by source ---
    const groupBySource = (rows: any[], type: string) => {
      const grouped: Record<string, any> = {};
      for (const row of rows) {
        const key = `${row.pesuser_name}-${row.dept}`;
        if (!grouped[key]) grouped[key] = { pesuser_name: row.pesuser_name, dept: row.dept };

        const data = { ...row };
        delete data.pesuser_name;
        delete data.dept;
        delete data.source;

        if (row.source === "main") {
          grouped[key][type] = data;
        } else {
          grouped[key][`counter_${type}`] = data;
        }
      }
      return Object.values(grouped);
    }

    const appraisalGrouped = groupBySource(appraisals, "appraisal");
    const performanceGrouped = groupBySource(performances, "performance");

    // --- Merge all datasets by pesuser_name + dept ---
    const merged: Record<string, any> = {};
    const merge = (list: any[]) => {
      for (const row of list) {
        const key = `${row.pesuser_name}-${row.dept}`;
        merged[key] = { ...merged[key], ...row };
      }
    }

    merge(appraisalGrouped);
    merge(performanceGrouped);

    return NextResponse.json(Object.values(merged));
  } catch (err: any) {
    console.error("Error fetching pending data scores:", err);
    return NextResponse.json({ error: "Failed to fetch pending scores ❌" }, { status: 500 });
  }
}