export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";

const n = (v: unknown) => (v == null ? null : Number(v));

// Appraisal scores for a department (used by the Assessment integrity test).
// The department came from the query string and there was no org clause, so a
// department name shared across tenants returned both tenants' scores.
export async function GET(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;

  const dept = new URL(req.url).searchParams.get("dept");
  if (!dept) {
    return NextResponse.json({ error: "Missing dept parameter" }, { status: 400 });
  }

  try {
    const rows = await prisma.appraisal.findMany({
      where: { dept, org },
      select: {
        pesuser_name: true,
        dept: true,
        teaching_quality_evaluation: true,
        research_quality_evaluation: true,
        administrative_quality_evaluation: true,
        community_quality_evaluation: true,
      },
    });

    // Decimal columns serialize as strings — convert to numbers for the client.
    const data = rows.map((r) => ({
      pesuser_name: r.pesuser_name,
      dept: r.dept,
      teaching_quality: n(r.teaching_quality_evaluation),
      research_quality: n(r.research_quality_evaluation),
      administrative_quality: n(r.administrative_quality_evaluation),
      community_quality: n(r.community_quality_evaluation),
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching appraisal by dept:", err);
    return NextResponse.json(
      { error: "Failed to fetch appraisal data" },
      { status: 500 },
    );
  }
}
