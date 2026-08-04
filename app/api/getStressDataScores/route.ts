import { NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { verifyToken } from "../_lib/authGuard";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const org = decoded.org;

    const body = await req.json();

    if (!org) {
      return NextResponse.json(
        { error: "org is required" },
        { status: 400 }
      );
    }

    // The evaluation must never mix cycles (#11). Scope Form 5 data to the
    // "effective settings cycle" = the LATEST cycle that actually collected
    // Form 5 for this org. This also implements carry-over: a feeling-only cycle
    // (no new Form 5, no reset) reuses the previous settings cycle's values
    // rather than showing empty or blended data. Data is always org-isolated.
    const cyclesWithScores = await prisma.stress_scores.findMany({
      where: { org, cycle_id: { not: null } },
      select: { cycle_id: true },
      distinct: ["cycle_id"],
      orderBy: { cycle_id: "desc" },
    });
    const effectiveCycleId = cyclesWithScores.length ? cyclesWithScores[0].cycle_id : null;

    const effectiveCycle = effectiveCycleId
      ? await prisma.stressCycle.findUnique({
          where: { id: effectiveCycleId },
          select: { id: true, created_at: true, phase: true },
        })
      : null;

    const data = await prisma.stress_scores.findMany({
      where: {
        org,
        ...(effectiveCycleId != null ? { cycle_id: effectiveCycleId } : {}),
      },
      select: {
        user_name: true,
        dept: true,
        organizational: true,
        student: true,
        administrative: true,
        teacher: true,
        parents: true,
        occupational: true,
        personal: true,
        academic_program: true,
        negative_public_attitude: true,
        misc: true,
      },
    });

    // Enrich each entry with the staff member's faculty so results can be
    // aggregated at faculty level (stress_scores itself only stores dept).
    // Matched by name within the org; unmatched fall into "Unknown Faculty".
    const users = await prisma.pesuser.findMany({
      where: { org },
      select: { name: true, faculty_college: true },
    });
    const facultyByName = new Map<string, string>(
      users.map((u) => [u.name, u.faculty_college || "Unknown Faculty"] as [string, string]),
    );
    const enriched = data.map((d) => ({
      ...d,
      faculty: facultyByName.get(d.user_name ?? "") || "Unknown Faculty",
    }));

    // Return the data plus the cycle it belongs to, so the UI can label results
    // with their source cycle (old vs current never confused, #11).
    return NextResponse.json(
      {
        rows: enriched,
        cycle: effectiveCycle
          ? { id: effectiveCycle.id, created_at: effectiveCycle.created_at, phase: effectiveCycle.phase }
          : null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching stress scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stress scores" },
      { status: 500 }
    );
  }
}
