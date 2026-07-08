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

    await prisma.unit_head_overloading.create({
      data: {
        org,
        actual_hours: actualHours,
        num_subordinates: numSubs,
        extra_complexity: extraComplexity,
        optimal_hours: optimalHours,
        optimal_k: optimalK || 0,
        complexity_factor: CF,
        overload_ratio: OR,
        status,
      },
    });

    return NextResponse.json({ message: "Record saved successfully" });
  } catch (error) {
    console.error("Error saving unit_head_overloading record:", error);
    return NextResponse.json({ error: "Failed to save record" }, { status: 500 });
  }
}
