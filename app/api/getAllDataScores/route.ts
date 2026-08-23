import { NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { hodCounterScores, staffPerformance } from "@/app/lib/performance/results";
import { jwtDecode } from "jwt-decode";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwtDecode<{ org: string }>(token);
    const org = decoded.org;

    const body = await req.json();
    const { name } = body;

    const where = {
      ...(org ? { org } : {}),
      ...(name ? { pesuser_name: name } : {}),
    };
    const appraisalSelect = {
      pesuser_name: true, dept: true,
      teaching_quality_evaluation: true, research_quality_evaluation: true,
      administrative_quality_evaluation: true, community_quality_evaluation: true,
    } as const;
    const performanceSelect = {
      pesuser_name: true, dept: true,
      competence: true, integrity: true, compatibility: true, use_of_resources: true,
    } as const;
    const stressSelect = {
      pesuser_name: true, dept: true,
      stress_theme: true, stress_feeling_frequency: true,
    } as const;
    const withSource = (rows: any[], source: string) =>
      rows.map((r) => ({ ...r, source }));

    // --- Appraisals (main + counter) ---
    const [mainAppraisals, counterAppraisals] = await Promise.all([
      prisma.appraisal.findMany({ where, select: appraisalSelect }),
      prisma.counter_appraisal.findMany({ where, select: appraisalSelect }),
    ]);
    const appraisals = [...withSource(mainAppraisals, "main"), ...withSource(counterAppraisals, "counter")];

    // --- Performance (main + counter) ---
    // From the performance model rather than the old flat tables. `where` is
    // the org (and department, where the caller scoped it).
    const [mainPerformances, counterPerformances] = await Promise.all([
      staffPerformance({ org: where.org as string, dept: (where as any).dept ?? null }),
      hodCounterScores({ org: where.org as string, dept: (where as any).dept ?? null }),
    ]);
    const performances = [...withSource(mainPerformances, "main"), ...withSource(counterPerformances, "counter")];

    // --- Stress (main + counter) ---
    const [mainStresses, counterStresses] = await Promise.all([
      prisma.stress.findMany({ where, select: stressSelect }),
      prisma.counter_stress.findMany({ where, select: stressSelect }),
    ]);
    const stresses = [...withSource(mainStresses, "main"), ...withSource(counterStresses, "counter")];

    // --- Leadership scores (only one source) ---
    const leadership = await prisma.lead_scores.findMany({
      select: {
        pesuser_name: true, dept: true,
        competence: true, integrity: true, compatibility: true, use_of_resources: true,
      },
    });

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
    const stressGrouped = groupBySource(stresses, "stress");

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
    merge(stressGrouped);

    // attach leadership scores
    for (const l of leadership) {
      const key = `${l.pesuser_name}-${l.dept}`;
      merged[key] = { ...merged[key], leadership: l };
    }

    return NextResponse.json(Object.values(merged));
  } catch (err: any) {
    console.error("Error fetching all data scores:", err);
    return NextResponse.json({ error: "Failed to fetch appraisal data" }, { status: 500 });
  }
}
