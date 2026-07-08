import { NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    const results = await prisma.counter_userperformance.findMany({
      where: name ? { pesuser_name: name } : undefined,
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
    console.error("Error fetching counter performance:", err);
    return NextResponse.json({ error: "Failed to fetch counter performance" }, { status: 500 });
  }
}
