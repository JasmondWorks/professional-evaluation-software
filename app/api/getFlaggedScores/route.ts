import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { hodCounterScores, staffPerformance } from "@/app/lib/performance/results";
import { jwtDecode } from "jwt-decode";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let org;
    try {
      const decoded: any = jwtDecode(token);
      org = decoded?.org;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!org) return NextResponse.json({ error: "Org missing in token" }, { status: 400 });

    const where = { pending: true, ...(org ? { org } : {}) };
    const appraisalSelect = {
      pesuser_name: true,
      dept: true,
      teaching_quality_evaluation: true,
      research_quality_evaluation: true,
      administrative_quality_evaluation: true,
      community_quality_evaluation: true,
    } as const;
    const performanceSelect = {
      pesuser_name: true,
      dept: true,
      competence: true,
      integrity: true,
      compatibility: true,
      use_of_resources: true,
    } as const;

    const withSource = (rows: any[], source: string) =>
      rows.map((r) => ({ ...r, source }));

    // --- Appraisals (main + counter) ---
    const [mainAppraisals, counterAppraisals] = await Promise.all([
      prisma.appraisal.findMany({ where, select: appraisalSelect }),
      prisma.counter_appraisal.findMany({ where, select: appraisalSelect }),
    ]);
    const appraisals = [
      ...withSource(mainAppraisals, "main"),
      ...withSource(counterAppraisals, "counter"),
    ];

    // --- Performance (main + counter) ---
    // From the performance model rather than the old flat tables. `where` is
    // the org (and department, where the caller scoped it).
    const [mainPerformances, counterPerformances] = await Promise.all([
      staffPerformance({ org: where.org as string, dept: (where as any).dept ?? null }),
      hodCounterScores({ org: where.org as string, dept: (where as any).dept ?? null }),
    ]);
    const performances = [
      ...withSource(mainPerformances, "main"),
      ...withSource(counterPerformances, "counter"),
    ];

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