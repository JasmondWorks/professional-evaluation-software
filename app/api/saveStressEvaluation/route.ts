import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { jwtDecode } from "jwt-decode";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const decoded: any = jwtDecode(token);
    const org = decoded?.org;
    if (!org) {
      return NextResponse.json({ error: "Missing org in token" }, { status: 400 });
    }

    const body = await req.json();
    const { stress, pressure, conflict, anovaResult } = body;

    const record = await prisma.stress_evaluation_history.create({
      data: {
        org,
        stress_factor: Number(stress),
        pressure_factor: Number(pressure),
        conflict_factor: Number(conflict),
        anova_result: anovaResult ? JSON.stringify(anovaResult) : null,
      },
    });

    // Close the cycle and record the 5% verdict. A rejected H0 means the feeling
    // shifted significantly, so the NEXT cycle must re-collect Form 5 (settings).
    const needsReset = !!(anovaResult?.conclusion || "").includes("Reject");
    const cycle = await prisma.stressCycle.findFirst({
      where: { org },
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
    });
    if (cycle && cycle.phase !== "evaluated") {
      await prisma.stressCycle.update({
        where: { id: cycle.id },
        data: { phase: "evaluated", needs_reset: needsReset },
      });
    }

    return NextResponse.json({ success: true, record, needsReset }, { status: 201 });
  } catch (err: any) {
    console.error("Error saving stress evaluation:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
