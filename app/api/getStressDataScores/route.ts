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

    const data = await prisma.$queryRawUnsafe<any[]>(
      `
      SELECT user_name, dept, organizational, student, administrative, teacher, parents,
             occupational, personal, academic_program, negative_public_attitude, misc
      FROM stress_scores
      WHERE org = $1
      `,
      org
    );

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
