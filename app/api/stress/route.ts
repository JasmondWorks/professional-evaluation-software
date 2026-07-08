import { NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { org } = body;

    // Validate input
    if (!org || typeof org !== 'string') {
      return NextResponse.json({ error: "Invalid org parameter" }, { status: 400 });
    }

    const results = await prisma.stress.findMany({
      where: { org },
      select: {
        pesuser_name: true,
        dept: true,
        stress_theme: true,
        stress_feeling_frequency: true,
      },
    });

    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching stress data:", err);
    return NextResponse.json({ error: "Failed to fetch stress" }, { status: 500 });
  }
}
