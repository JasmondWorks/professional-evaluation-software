export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../prisma.dev";

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

// GET /api/workSampling/studies/[id] — load a full study with positions + observations
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureColumnsExist();
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    const [studies, positions, observations] = await Promise.all([
      prisma.$queryRawUnsafe(
        `SELECT * FROM "WorkSamplingStudy" WHERE id = $1`,
        id
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `SELECT * FROM "WorkSamplingPosition" WHERE "studyId" = $1 ORDER BY id ASC`,
        id
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `SELECT o.* FROM "WorkSamplingObservation" o
         JOIN "WorkSamplingPosition" p ON o."positionId" = p.id
         WHERE p."studyId" = $1
         ORDER BY o.id ASC`,
        id
      ) as Promise<any[]>,
    ]);

    if (!studies.length) {
      return NextResponse.json({ success: false, error: "Study not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { study: studies[0], positions, observations },
    });
  } catch (error) {
    console.error("Error loading study:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PATCH /api/workSampling/studies/[id] — update study parameters
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureColumnsExist();
    const id = Number(params.id);
    const body = await req.json();

    const {
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
      org,
      department,
      analyst,
      authorizedBy,
      lockedDates,
      lockedTimes,
    } = body;

    const query = `
      UPDATE "WorkSamplingStudy" SET
        org = $1, department = $2, analyst = $3, "authorizedBy" = $4,
        "confidenceLevel" = $5, "desiredAccuracy" = $6, "preliminaryP" = $7,
        "totalObservationsRequired" = $8, "studyMonth" = $9,
        "studyMonths" = COALESCE($10::jsonb, "studyMonths"),
        "observationsPerDay" = $11, "workingHoursPerDay" = $12,
        "workStartTime" = $13, "minCycleDuration" = $14,
        "maxDuration" = $15, "estimatedStudyDays" = $16,
        "availableAnnualHours" = $17, "defaultPerformanceAllowance" = $18,
        "lockedDates" = COALESCE($19::jsonb, "lockedDates"),
        "lockedTimes" = COALESCE($20::jsonb, "lockedTimes")
      WHERE id = $21
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
      id
    );

    const rows = result as any[];
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error updating study:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/workSampling/studies/[id] — delete a study and all related data
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    // Due to the lack of explicit cascading deletes in the raw sql or schema for these specific manual relations,
    // we delete dependent records first.
    // 1. Observations
    await prisma.$executeRawUnsafe(
      `DELETE FROM "WorkSamplingObservation" WHERE "positionId" IN (SELECT id FROM "WorkSamplingPosition" WHERE "studyId" = $1)`,
      id
    );
    // 2. Positions
    await prisma.$executeRawUnsafe(
      `DELETE FROM "WorkSamplingPosition" WHERE "studyId" = $1`,
      id
    );
    // 3. The Study
    await prisma.$executeRawUnsafe(
      `DELETE FROM "WorkSamplingStudy" WHERE id = $1`,
      id
    );

    return NextResponse.json({ success: true, message: "Study deleted successfully" });
  } catch (error) {
    console.error("Error deleting study:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

