import { NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_name, org } = body;

    if (!user_name || !org) {
      return NextResponse.json(
        { error: "user_name and org are required" },
        { status: 400 }
      );
    }

    console.log("Fetching stress scores for:", { user_name, org });

    const row = await prisma.stress_scores.findFirst({
      where: { user_name, org },
      select: {
        organizational: true,
        student: true,
        administrative: true,
        teacher: true,
        parents: true,
        occupational: true,
        personal: true,
        academic_program: true,
        negative_public_attitude: true,
        misc: true,
      },
    });

    if (!row) {
      return NextResponse.json(
        { error: "No stress scores found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: row }, { status: 200 });
  } catch (error) {
    console.error("Error fetching stress scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stress scores" },
      { status: 500 }
    );
  }
}
