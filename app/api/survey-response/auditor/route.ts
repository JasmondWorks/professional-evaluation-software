// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import prisma from "@/app/api/prisma.dev";
import { authorize, tokenFromRequest } from "../../_lib/authGuard";

export async function POST(req: Request) {
  try {
    // jwtDecode parses a token without checking its signature, so this org was
    // whatever the caller wrote into one.
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;

    const org = auth.user.org ? String(auth.user.org) : null;
    if (!org) return NextResponse.json({ error: "Org missing in token" }, { status: 400 });

    const { pesuser_name, responses } = await req.json();

    if (!pesuser_name || !responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    await prisma.auditor_survey_responses.createMany({
      data: responses.map((r: { section: string; question: string; response: string }) => ({
        pesuser_name,
        org,
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
