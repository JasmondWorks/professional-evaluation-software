import { NextRequest, NextResponse } from "next/server";
import prisma from "../../prisma.dev";
import { authorize, tokenFromRequest } from "../../_lib/authGuard";
import { orgOfStudy, orgOfPosition, notYours } from "../_scope";

// POST — add a position to a study
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { studyId, name, department, performanceAllowance } = body;

    if (!studyId || !name) {
      return NextResponse.json(
        { success: false, error: "studyId and name are required" },
        { status: 400 }
      );
    }

    // The study id arrives from the browser; it has to be the caller's own.
    const owner = await orgOfStudy(Number(studyId));
    if (!owner || owner !== auth.user.org) return notYours();

    const result = await prisma.workSamplingPosition.create({
      data: {
        studyId: Number(studyId),
        name: name,
        department: department ?? null,
        performanceAllowance: performanceAllowance ?? null,
      }
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error saving position:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE — remove a position (and cascades its observations)
export async function DELETE(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    const owner = await orgOfPosition(Number(id));
    if (!owner || owner !== auth.user.org) return notYours();
    
    // Explicitly delete observations first to be safe, then delete the position
    await prisma.workSamplingObservation.deleteMany({
      where: { positionId: Number(id) }
    });
    
    await prisma.workSamplingPosition.delete({
      where: { id: Number(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting position:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
