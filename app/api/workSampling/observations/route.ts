import { NextRequest, NextResponse } from "next/server";
import prisma from "../../prisma.dev";

// POST — record a single observation (with programmatic upsert)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { positionId, date, time, isBusy, performanceRating, notes } = body;

    if (!positionId || !date || !time) {
      return NextResponse.json(
        { success: false, error: "positionId, date and time are required" },
        { status: 400 }
      );
    }

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
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }
    
    await prisma.workSamplingObservation.delete({
      where: { id: Number(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting observation:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
