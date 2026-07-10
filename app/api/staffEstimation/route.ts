export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../prisma.dev"; // Make sure prisma client is set up properly
import { jwtDecode } from "jwt-decode";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwtDecode<{ org: string }>(token);

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
        org: decoded.org,
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
