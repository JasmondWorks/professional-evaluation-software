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
    const existing = await prisma.$queryRawUnsafe(
      `SELECT * FROM "WorkSamplingObservation" WHERE "positionId" = $1 AND date = $2 AND time = $3`,
      Number(positionId),
      date,
      time
    ) as any[];

    let result;
    if (existing.length > 0) {
      // Update existing observation
      result = await prisma.$queryRawUnsafe(
        `UPDATE "WorkSamplingObservation"
         SET "isBusy" = $1, "performanceRating" = $2, notes = $3
         WHERE id = $4
         RETURNING *;`,
        Boolean(isBusy),
        performanceRating ?? null,
        notes ?? null,
        existing[0].id
      );
    } else {
      // Insert new observation
      const query = `
        INSERT INTO "WorkSamplingObservation"
          ("positionId", date, time, "isBusy", "performanceRating", notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      result = await prisma.$queryRawUnsafe(
        query,
        Number(positionId),
        date,
        time,
        Boolean(isBusy),
        performanceRating ?? null,
        notes ?? null
      );
    }

    const rows = result as any[];
    return NextResponse.json({ success: true, data: rows[0] });
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
    await prisma.$queryRawUnsafe(
      `DELETE FROM "WorkSamplingObservation" WHERE id = $1`,
      Number(id)
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting observation:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
