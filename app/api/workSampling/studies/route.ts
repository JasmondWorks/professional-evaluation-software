export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../prisma.dev";

// POST — create a new study (with parameters)
export async function POST(req: NextRequest) {
  try {
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

    // Prisma serializes the Json columns (studyMonths/lockedDates/lockedTimes)
    // natively — the old raw insert stringified them, causing a jsonb/text
    // type error (42804) that broke study creation and, in turn, Add Position.
    const study = await prisma.workSamplingStudy.create({
      data: {
        org: org ?? null,
        department: department ?? null,
        analyst: analyst ?? null,
        authorizedBy: authorizedBy ?? null,
        confidenceLevel: confidenceLevel ?? null,
        desiredAccuracy: desiredAccuracy ?? null,
        preliminaryP: preliminaryP ?? null,
        totalObservationsRequired: totalObservationsRequired ?? null,
        studyMonth: studyMonth ?? null,
        studyMonths: studyMonths ?? undefined,
        observationsPerDay: observationsPerDay ?? null,
        workingHoursPerDay: workingHoursPerDay ?? null,
        workStartTime: workStartTime ?? null,
        minCycleDuration: minCycleDuration ?? null,
        maxDuration: maxDuration ?? null,
        estimatedStudyDays: estimatedStudyDays ?? null,
        availableAnnualHours: availableAnnualHours ?? null,
        defaultPerformanceAllowance: defaultPerformanceAllowance ?? null,
        lockedDates: lockedDates ?? undefined,
        lockedTimes: lockedTimes ?? undefined,
      },
    });

    return NextResponse.json({ success: true, data: study });
  } catch (error) {
    console.error("Error creating work sampling study:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// GET — list all studies (with position and observation counts)
export async function GET() {
  try {
      const results = await prisma.$queryRaw`
      SELECT s.*,
        (SELECT COUNT(*)::int FROM "WorkSamplingPosition" WHERE "studyId" = s.id) AS "positionCount",
        (SELECT COUNT(*)::int FROM "WorkSamplingObservation" o
          JOIN "WorkSamplingPosition" p ON o."positionId" = p.id
          WHERE p."studyId" = s.id) AS "observationCount"
      FROM "WorkSamplingStudy" s
      ORDER BY s."createdAt" DESC
    `;
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching studies:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
