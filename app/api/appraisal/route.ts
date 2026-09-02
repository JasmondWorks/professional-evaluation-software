import { NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";

// Appraisal scores. Unauthenticated and unscoped: a name in the body read that
// person's scores in whichever organization happened to hold the name, and an
// empty body read everyone's.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;

  try {
    const { pesuser_name } = await req.json();
    const results = await prisma.appraisal.findMany({
      where: { org, ...(pesuser_name ? { pesuser_name } : {}) },
      select: {
        pesuser_name: true,
        dept: true,
        teaching_quality_evaluation: true,
        research_quality_evaluation: true,
        administrative_quality_evaluation: true,
        community_quality_evaluation: true,
      },
    });
    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching appraisal data:", err);
    return NextResponse.json({ error: "Failed to fetch appraisal" }, { status: 500 });
  }
}
