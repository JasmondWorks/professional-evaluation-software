import { NextRequest, NextResponse } from "next/server";
import prisma from "../../prisma.dev";

// POST — add a position to a study
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studyId, name, department, performanceAllowance } = body;

    if (!studyId || !name) {
      return NextResponse.json(
        { success: false, error: "studyId and name are required" },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO "WorkSamplingPosition" ("studyId", name, department, "performanceAllowance")
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const result = await prisma.$queryRawUnsafe(
      query,
      Number(studyId),
      name,
      department ?? null,
      performanceAllowance ?? null
    );

    const rows = result as any[];
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error saving position:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE — remove a position (and cascades its observations)
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }
    await prisma.$queryRawUnsafe(
      `DELETE FROM "WorkSamplingPosition" WHERE id = $1`,
      Number(id)
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting position:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
