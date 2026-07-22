export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../prisma.dev"; // Make sure prisma client is set up properly
import { authorize, tokenFromRequest } from "../_lib/authGuard";

export async function POST(req: Request) {
  try {
    // Staff determination is for admins, industrial engineers, or anyone
    // granted define_performance.
    const auth = authorize(tokenFromRequest(req), {
      roles: ["industrial-engineer"],
      anyOf: ["can_define_performance_metrics"],
    });
    if (!auth.ok) return auth.response;

    const body = await req.json();

    const {
      methodType,
      staffNeeded,
      basicTime,
      relaxAllowance,
      loadFactor,
      numTasks,
      timePerTask,
      availableHoursPerPerson,
      observedTime,
      estimatedTime,
      correctiveFactor,
      personsEstimate,
      A,
      B,
      confidenceLimit,
      utilizationFactor,
      annualManHours,
      standardManHours
    } = body;

    const result = await prisma.staffEstimation.create({
      data: {
        methodType,
        staffNeeded,
        basicTime,
        relaxAllowance,
        loadFactor,
        numTasks,
        timePerTask,
        availableHoursPerPerson,
        observedTime,
        estimatedTime,
        correctiveFactor,
        personsEstimate,
        A,
        B,
        confidenceLimit,
        utilizationFactor,
        annualManHours,
        standardManHours,
        org: auth.user.org ?? undefined,
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error saving staff estimation:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use GET in getStaffEstimation route instead." }, { status: 405 });
}
