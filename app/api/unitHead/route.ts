import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      org,
      actualHours,
      numSubs,
      extraComplexity,
      optimalHours,
      optimalK,
      CF,
      OR,
      status,
    } = body;

    if (!org)
      return NextResponse.json({ error: "Missing org" }, { status: 400 });

    await prisma.$executeRawUnsafe(`
      INSERT INTO unit_head_overloading 
      (org, actual_hours, num_subordinates, extra_complexity, optimal_hours, optimal_k, complexity_factor, overload_ratio, status)
      VALUES (
        '${org}',
        ${actualHours},
        ${numSubs},
        ${extraComplexity},
        ${optimalHours},
        ${optimalK || 0},
        ${CF},
        ${OR},
        '${status}'
      )
    `);

    return NextResponse.json({ message: "Record saved successfully" });
  } catch (error) {
    console.error("Error saving unit_head_overloading record:", error);
    return NextResponse.json({ error: "Failed to save record" }, { status: 500 });
  }
}
