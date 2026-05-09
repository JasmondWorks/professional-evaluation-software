import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev"; // adjust if your prisma file is elsewhere

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      org,
      group_by,
      ssto,
      sstr,
      sse,
      f_statistic,
      critical_value,
      conclusion,
      df_between,
      df_within,
      ms_between,
      ms_within,
      mean,
      std_dev,
    } = body;

    // Use Prisma raw query for direct insert
    const result = await prisma.$queryRawUnsafe(`
      INSERT INTO stress_analysis_results (
        org, group_by, ssto, sstr, sse, f_statistic, critical_value, conclusion,
        df_between, df_within, ms_between, ms_within, mean, std_dev
      )
      VALUES (
        '${org}', '${group_by}', ${ssto}, ${sstr}, ${sse}, ${f_statistic}, ${critical_value},
        '${conclusion}', ${df_between}, ${df_within}, ${ms_between}, ${ms_within}, ${mean}, ${std_dev}
      )
      RETURNING *;
    `);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error saving ANOVA result:", error);
    return NextResponse.json(
      { success: false, message: "Error saving ANOVA result" },
      { status: 500 }
    );
  }
}
