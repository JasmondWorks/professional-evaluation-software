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

    // Use parameterized query to prevent SQL injection
    const results = await prisma.$queryRaw<any[]>`
      SELECT pesuser_name, dept, stress_theme, stress_feeling_frequency
      FROM stress
      WHERE org = ${org};
    `;

    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching stress data:", err);
    return NextResponse.json({ error: "Failed to fetch stress" }, { status: 500 });
  }
}
