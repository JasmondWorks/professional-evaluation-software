// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import prisma from "@/app/api/prisma.dev";
import { authorize, tokenFromRequest } from "../../_lib/authGuard";
import { isOnboardedAuditor } from "@/app/lib/auditorOnboarding";

// Records an auditor's survey answers during an evaluation cycle. Had no role
// check at all — any signed-in account could write rows here.
export async function POST(req: Request) {
  try {
    const auth = authorize(tokenFromRequest(req), { roles: ["auditor"] });
    if (!auth.ok) return auth.response;

    const orgId = auth.user.orgId ?? null;
    if (!orgId) return NextResponse.json({ error: "Org missing in token" }, { status: 400 });

    if (auth.user.role === "auditor" && !(await isOnboardedAuditor(auth.user.userID, orgId))) {
      return NextResponse.json(
        { error: "Complete your onboarding questionnaire before auditing." },
        { status: 403 },
      );
    }

    const { pesuser_name, responses } = await req.json();

    if (!pesuser_name || !responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    await prisma.auditor_survey_responses.createMany({
      data: responses.map((r: { section: string; question: string; response: string }) => ({
        pesuser_name,
        org_id: orgId,
        org: auth.user.org ?? null,
        section: r.section,
        question: r.question,
        response: r.response,
      })),
    });

    return NextResponse.json({ success: true, message: "Survey saved successfully" });
  } catch (err) {
    console.error("Error saving survey:", err);
    return NextResponse.json({ error: "Failed to save survey" }, { status: 500 });
  }
}
