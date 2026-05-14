import { NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: "Invalid name parameter" }, { status: 400 });
    }

    // Use parameterized query to prevent SQL injection
    const results = await prisma.$queryRaw<any[]>`
      SELECT pesuser_name, dept, competence, integrity, compatibility, use_of_resources
      FROM userperformance
      WHERE pesuser_name = ${name};
    `;

    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching performance data:", err);
    return NextResponse.json({ error: "Failed to fetch performance" }, { status: 500 });
  }
}
