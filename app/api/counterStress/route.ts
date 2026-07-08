import { NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    const results = await prisma.counter_stress.findMany({
      where: name ? { pesuser_name: name } : undefined,
      select: {
        pesuser_name: true,
        dept: true,
        stress_theme: true,
        stress_feeling_frequency: true,
      },
    });

    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching counter stress:", err);
    return NextResponse.json({ error: "Failed to fetch counter stress" }, { status: 500 });
  }
}