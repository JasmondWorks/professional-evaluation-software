import { NextResponse } from "next/server";
import prisma from "../prisma.dev"; // Make sure prisma client is set up properly

export async function POST(req: Request) {
  try {
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

    // Insert using queryRaw
    const insertQuery = `
      INSERT INTO "StaffEstimation" (
        "methodType", "staffNeeded", "basicTime", "relaxAllowance", "loadFactor", 
        "numTasks", "timePerTask", "availableHoursPerPerson",
        "observedTime", "estimatedTime", "correctiveFactor", "personsEstimate",
        "A", "B", "confidenceLimit", "utilizationFactor", "annualManHours", "standardManHours"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
      )
      RETURNING *;
    `;

    const result = await prisma.$queryRawUnsafe(insertQuery,
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
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error saving staff estimation:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const results = await prisma.$queryRawUnsafe(`SELECT * FROM "StaffEstimation" ORDER BY "createdAt" DESC`);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
