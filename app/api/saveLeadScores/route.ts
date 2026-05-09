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
    await prisma.$executeRawUnsafe(
      `INSERT INTO lead_scores (pesuser_name, dept, competence, integrity, compatibility, use_of_resources)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (pesuser_name, dept)
       DO UPDATE SET competence = $3, integrity = $4, compatibility = $5, use_of_resources = $6`,
      pesuser_name,
      dept,
      scores.competence ?? null,
      scores.integrity ?? null,
      scores.compatibility ?? null,
      scores.use_of_resources ?? null
    );
    return NextResponse.json({ message: 'Lead scores saved' }, { status: 200 });
  } catch (error) {
    console.error('Error saving lead scores:', error);
    return NextResponse.json({ error: 'Failed to save lead scores' }, { status: 500 });
  }
}
