export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { jwtDecode } from 'jwt-decode';
import { hodCounterScores, staffPerformance } from '@/app/lib/performance/results';

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwtDecode<{ org: string }>(token);
  const org = decoded.org;

  if (!org) {
    return NextResponse.json(
      { error: "Missing org parameter" },
      { status: 400 }
    );
  }

  try {
    const appraisalSelect = {
      teaching_quality_evaluation: true,
      research_quality_evaluation: true,
      administrative_quality_evaluation: true,
      community_quality_evaluation: true,
      pesuser_name: true,
    } as const;

    // appraisal values
    const appraisal = await prisma.appraisal.findMany({
      where: { org },
      select: appraisalSelect,
    });

    // counter appraisal values
    const counterAppraisal = await prisma.counter_appraisal.findMany({
      where: { org },
      select: appraisalSelect,
    });

    // Performance now comes from the model rather than the old flat tables:
    // the four criteria as settled, and the heads' objections beside them.
    const userperformance = await staffPerformance({ org });
    const counterUserperformance = await hodCounterScores({ org });

    // stress values
    const stress = await prisma.stress.findMany({
      where: { org },
      select: {
        stress_category: true,
        stress_theme_form: true,
        stress_feeling_frequency_form: true,
        pesuser_name: true,
      },
    });

    // counter stress values
    const counterStress = await prisma.counter_stress.findMany({
      where: { org },
      select: {
        stress_theme_form: true,
        stress_feeling_frequency_form: true,
        pesuser_name: true,
      },
    });

    return NextResponse.json({
      appraisal,
      counterAppraisal,
      userperformance,
      counterUserperformance,
      stress,
      counterStress,
    });
  } catch (error) {
    console.error("Error fetching analysis dataset:", error);
    return NextResponse.json(
      { error: "Failed to fetch dataset" },
      { status: 500 }
    );
  }
}
 