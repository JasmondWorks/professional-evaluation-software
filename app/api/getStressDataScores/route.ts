import { NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { org } = body;

    if (!org) {
      return NextResponse.json(
        { error: "org is required" },
        { status: 400 }
      );
    }

    console.log("Fetching stress scores for:", { org });

    const data = await prisma.stress_scores.findMany({
      where: { org },
      select: {
        user_name: true,
        dept: true,
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

    if (!data) {
      return NextResponse.json(
        { error: "No stress scores found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data , { status: 200 });
  } catch (error) {
    console.error("Error fetching stress scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stress scores" },
      { status: 500 }
    );
  }
}
