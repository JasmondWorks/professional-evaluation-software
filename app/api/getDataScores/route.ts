export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';
import { hodCounterScores, staffPerformance } from '@/app/lib/performance/results';
import { authorize, tokenFromRequest } from '../_lib/authGuard';

// The org was taken from an unverified jwtDecode, so every score in this
// response could be pulled for any organization by hand-writing a token.
export async function GET(req: Request) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;

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
 