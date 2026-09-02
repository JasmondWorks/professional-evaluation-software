export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../prisma.dev";
import { authorize, tokenFromRequest } from "../../../_lib/authGuard";
import { orgOfStudy, notYours } from "../../_scope";

// GET /api/workSampling/studies/[id] — load a full study with positions + observations
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    // The study id comes off the URL, so it has to be checked against the
    // caller's org before any of the study is handed back.
    const owner = await orgOfStudy(id);
    if (!owner || owner !== auth.user.org) return notYours();

    const [study, positions, observations] = await Promise.all([
      prisma.workSamplingStudy.findUnique({ where: { id } }),
      prisma.workSamplingPosition.findMany({ 
        where: { studyId: id },
        orderBy: { id: 'asc' }
      }),
      prisma.workSamplingObservation.findMany({
        where: { position: { studyId: id } },
        orderBy: { id: 'asc' }
      }),
    ]);

    if (!study) {
      return NextResponse.json({ success: false, error: "Study not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { study, positions, observations },
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
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const id = Number(params.id);

    const owner = await orgOfStudy(id);
    if (!owner || owner !== auth.user.org) return notYours();

    const body = await req.json();

    // `org` is deliberately not updatable from the body: it is what decides who
    // may reach the study, so letting the body set it would let a caller hand
    // their own study to another organization — or take one from it.
    const updateData: any = {};
    if (body.department !== undefined) updateData.department = body.department;
    if (body.analyst !== undefined) updateData.analyst = body.analyst;
    if (body.authorizedBy !== undefined) updateData.authorizedBy = body.authorizedBy;
    if (body.confidenceLevel !== undefined) updateData.confidenceLevel = body.confidenceLevel;
    if (body.desiredAccuracy !== undefined) updateData.desiredAccuracy = body.desiredAccuracy;
    if (body.preliminaryP !== undefined) updateData.preliminaryP = body.preliminaryP;
    if (body.totalObservationsRequired !== undefined) updateData.totalObservationsRequired = body.totalObservationsRequired;
    if (body.studyMonth !== undefined) updateData.studyMonth = body.studyMonth;
    if (body.studyMonths !== undefined) updateData.studyMonths = body.studyMonths;
    if (body.observationsPerDay !== undefined) updateData.observationsPerDay = body.observationsPerDay;
    if (body.workingHoursPerDay !== undefined) updateData.workingHoursPerDay = body.workingHoursPerDay;
    if (body.workStartTime !== undefined) updateData.workStartTime = body.workStartTime;
    if (body.minCycleDuration !== undefined) updateData.minCycleDuration = body.minCycleDuration;
    if (body.maxDuration !== undefined) updateData.maxDuration = body.maxDuration;
    if (body.estimatedStudyDays !== undefined) updateData.estimatedStudyDays = body.estimatedStudyDays;
    if (body.availableAnnualHours !== undefined) updateData.availableAnnualHours = body.availableAnnualHours;
    if (body.defaultPerformanceAllowance !== undefined) updateData.defaultPerformanceAllowance = body.defaultPerformanceAllowance;
    if (body.lockedDates !== undefined) updateData.lockedDates = body.lockedDates;
    if (body.lockedTimes !== undefined) updateData.lockedTimes = body.lockedTimes;

    const result = await prisma.workSamplingStudy.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: result });
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

    // Since schema has onDelete: Cascade, deleting the study is sufficient,
    // but we can explicitly delete dependents first to be absolutely sure.
    await prisma.workSamplingObservation.deleteMany({
      where: { position: { studyId: id } }
    });
    
    await prisma.workSamplingPosition.deleteMany({
      where: { studyId: id }
    });
    
    await prisma.workSamplingStudy.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Study deleted successfully" });
  } catch (error) {
    console.error("Error deleting study:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

