export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";

const n = (v: unknown) => (v == null ? null : Number(v));

// Performance scores for a department (used by the Assessment integrity test).
export async function GET(req: NextRequest) {
  const dept = new URL(req.url).searchParams.get("dept");
  if (!dept) {
    return NextResponse.json({ error: "Missing dept parameter" }, { status: 400 });
  }

  try {
    const rows = await prisma.userperformance.findMany({
      where: { dept },
      select: {
        pesuser_name: true,
        dept: true,
        competence: true,
        integrity: true,
        compatibility: true,
        use_of_resources: true,
      },
    });

    const data = rows.map((r) => ({
      pesuser_name: r.pesuser_name,
      dept: r.dept,
      competence: n(r.competence),
      integrity: n(r.integrity),
      compatibility: n(r.compatibility),
      use_of_resources: n(r.use_of_resources),
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching performance by dept:", err);
    return NextResponse.json(
      { error: "Failed to fetch performance data" },
      { status: 500 },
    );
  }
}
