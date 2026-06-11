import { NextRequest, NextResponse } from "next/server";
import prisma from "../../prisma.dev";

// Helper to run raw SQL migrations to ensure columns exist in development/production dynamically.
async function ensureColumnsExist() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "WorkSamplingStudy" ADD COLUMN IF NOT EXISTS "lockedDates" jsonb;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "WorkSamplingStudy" ADD COLUMN IF NOT EXISTS "lockedTimes" jsonb;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "WorkSamplingStudy" ADD COLUMN IF NOT EXISTS "studyMonths" jsonb;
    `);
  } catch (error) {
    console.error("Auto-migration column check failed:", error);
  }
}

// POST — create a new study (with parameters)
export async function POST(req: NextRequest) {
  try {
    await ensureColumnsExist();
    const body = await req.json();
    const {
      org,
      department,
      analyst,
      authorizedBy,
      confidenceLevel,
      desiredAccuracy,
      preliminaryP,
      totalObservationsRequired,
      studyMonth,
      studyMonths,
      observationsPerDay,
      workingHoursPerDay,
      workStartTime,
      minCycleDuration,
      maxDuration,
      estimatedStudyDays,
      availableAnnualHours,
      defaultPerformanceAllowance,
      lockedDates,
      lockedTimes,
    } = body;

    const query = `
      INSERT INTO "WorkSamplingStudy" (
        org, department, analyst, "authorizedBy",
        "confidenceLevel", "desiredAccuracy", "preliminaryP",
        "totalObservationsRequired", "studyMonth", "studyMonths",
        "observationsPerDay", "workingHoursPerDay", "workStartTime",
        "minCycleDuration", "maxDuration", "estimatedStudyDays",
        "availableAnnualHours", "defaultPerformanceAllowance",
        "lockedDates", "lockedTimes"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
      )
      RETURNING *;
    `;

    const result = await prisma.$queryRawUnsafe(
      query,
      org ?? null,
      department ?? null,
      analyst ?? null,
      authorizedBy ?? null,
      confidenceLevel ?? null,
      desiredAccuracy ?? null,
      preliminaryP ?? null,
      totalObservationsRequired ?? null,
      studyMonth ?? null,
      studyMonths ? JSON.stringify(studyMonths) : null,
      observationsPerDay ?? null,
      workingHoursPerDay ?? null,
      workStartTime ?? null,
      minCycleDuration ?? null,
      maxDuration ?? null,
      estimatedStudyDays ?? null,
      availableAnnualHours ?? null,
      defaultPerformanceAllowance ?? null,
      lockedDates ? JSON.stringify(lockedDates) : null,
      lockedTimes ? JSON.stringify(lockedTimes) : null,
    );

    const rows = result as any[];
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error creating work sampling study:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// GET — list all studies (with position and observation counts)
export async function GET() {
  try {
    await ensureColumnsExist();
    const results = await prisma.$queryRawUnsafe(`
      SELECT s.*,
        (SELECT COUNT(*)::int FROM "WorkSamplingPosition" WHERE "studyId" = s.id) AS "positionCount",
        (SELECT COUNT(*)::int FROM "WorkSamplingObservation" o
          JOIN "WorkSamplingPosition" p ON o."positionId" = p.id
          WHERE p."studyId" = s.id) AS "observationCount"
      FROM "WorkSamplingStudy" s
      ORDER BY s."createdAt" DESC
    `);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching studies:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
