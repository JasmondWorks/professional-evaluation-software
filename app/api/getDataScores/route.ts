import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const org = searchParams.get("org");

  if (!org) {
    return NextResponse.json(
      { error: "Missing org parameter" },
      { status: 400 }
    );
  }

  try {
    // appraisal values
    const appraisal = await prisma.$queryRaw<
      { teaching_quality_evaluation: number | null; research_quality_evaluation: number | null; administrative_quality_evaluation: number | null; community_quality_evaluation: number | null; pesuser_name: string }[]
    >`
      SELECT teaching_quality_evaluation, research_quality_evaluation, administrative_quality_evaluation, community_quality_evaluation, pesuser_name
      FROM appraisal
      WHERE org = ${org};
    `;

    // counter appraisal values
    const counterAppraisal = await prisma.$queryRaw<
      { teaching_quality_evaluation: number | null; research_quality_evaluation: number | null; administrative_quality_evaluation: number | null; community_quality_evaluation: number | null; pesuser_name: string }[]
    >`
      SELECT teaching_quality_evaluation, research_quality_evaluation, administrative_quality_evaluation, community_quality_evaluation, pesuser_name
      FROM counter_appraisal
      WHERE org = ${org};
    `;

    // userperformance values
    const userperformance = await prisma.$queryRaw<
      { competence: number | null; integrity: number | null; compatibility: number | null; use_of_resources: number | null; pesuser_name: string }[]
    >`
      SELECT competence, integrity, compatibility, use_of_resources, pesuser_name
      FROM userperformance
      WHERE org = ${org};
    `;

    // counter userperformance values
    const counterUserperformance = await prisma.$queryRaw<
      { competence: number | null; integrity: number | null; compatibility: number | null; use_of_resources: number | null; pesuser_name: string }[]
    >`
      SELECT competence, integrity, compatibility, use_of_resources, pesuser_name
      FROM counter_userperformance
      WHERE org = ${org};
    `;

    // stress values
    const stress = await prisma.$queryRaw<
      { stress_category: string | null; stress_theme_form: string | null; stress_feeling_frequency_form: string | null; pesuser_name: string }[]
    >`
      SELECT stress_category, stress_theme_form, stress_feeling_frequency_form, pesuser_name
      FROM stress
      WHERE org = ${org};
    `;

    // counter stress values
    const counterStress = await prisma.$queryRaw<
      { stress_theme_form: string | null; stress_feeling_frequency_form: string | null; pesuser_name: string }[]
    >`
      SELECT stress_theme_form, stress_feeling_frequency_form, pesuser_name
      FROM counter_stress
      WHERE org = ${org};
    `;

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
 