import { NextRequest, NextResponse } from 'next/server';
import prisma from '../prisma.dev';

// Table: lead_scores (pesuser_name, dept, competence, integrity, compatibility, use_of_resources)

export async function POST(req: NextRequest) {
  try {
    const { pesuser_name, dept, scores } = await req.json();
    if (!pesuser_name || !dept || !scores) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Upsert the lead's scores
    const values = {
      competence: scores.competence ?? null,
      integrity: scores.integrity ?? null,
      compatibility: scores.compatibility ?? null,
      use_of_resources: scores.use_of_resources ?? null,
    };
    await prisma.lead_scores.upsert({
      where: { pesuser_name_dept: { pesuser_name, dept } },
      update: values,
      create: { pesuser_name, dept, ...values },
    });
    return NextResponse.json({ message: 'Lead scores saved' }, { status: 200 });
  } catch (error) {
    console.error('Error saving lead scores:', error);
    return NextResponse.json({ error: 'Failed to save lead scores' }, { status: 500 });
  }
}
