import { NextResponse } from 'next/server';
import prisma from '../prisma.dev';

export async function GET() {
  const goals = await prisma.goals.findMany();
  return NextResponse.json({ goals });
}
