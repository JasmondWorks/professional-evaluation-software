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

    const results = await prisma.userperformance.findMany({
      where: { pesuser_name: name },
      select: {
        pesuser_name: true,
        dept: true,
        competence: true,
        integrity: true,
        compatibility: true,
        use_of_resources: true,
      },
    });

    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching performance data:", err);
    return NextResponse.json({ error: "Failed to fetch performance" }, { status: 500 });
  }
}
