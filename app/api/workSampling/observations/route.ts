import { NextRequest, NextResponse } from "next/server";
import prisma from "../../prisma.dev";
import { authorize, tokenFromRequest } from "../../_lib/authGuard";
import { orgOfPosition, notYours } from "../_scope";
import { validateData, workSamplingObservationSchema, formatZodErrors } from "@/app/lib/validation";

// POST — record a single observation (with programmatic upsert)
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const parsed = validateData(workSamplingObservationSchema, await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: formatZodErrors(parsed.errors!) },
        { status: 400 }
      );
    }
    const { positionId, date, time, isBusy, performanceRating, notes } = parsed.data!;

    // Observations are the study's raw data — anyone able to write them can
    // move the utilisation figure the study produces.
    const owner = await orgOfPosition(Number(positionId));
    if (!owner || owner !== auth.user.org) return notYours();

    // Check if an observation already exists for the same position, date, and time
    const existing = await prisma.workSamplingObservation.findFirst({
      where: {
        positionId: Number(positionId),
        date: date,
        time: time
      }
    });

    let result;
    if (existing) {
      // Update existing observation
      result = await prisma.workSamplingObservation.update({
        where: { id: existing.id },
        data: {
          isBusy: Boolean(isBusy),
          performanceRating: performanceRating ?? null,
          notes: notes ?? null
        }
      });
    } else {
      // Insert new observation
      result = await prisma.workSamplingObservation.create({
        data: {
          positionId: Number(positionId),
          date: date,
          time: time,
          isBusy: Boolean(isBusy),
          performanceRating: performanceRating ?? null,
          notes: notes ?? null
        }
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error saving observation:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE — remove an observation
export async function DELETE(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.workSamplingObservation.findUnique({
      where: { id: Number(id) },
      select: { positionId: true },
    });
    if (!existing) return notYours();

    const owner = await orgOfPosition(existing.positionId);
    if (!owner || owner !== auth.user.org) return notYours();

    await prisma.workSamplingObservation.delete({
      where: { id: Number(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting observation:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
