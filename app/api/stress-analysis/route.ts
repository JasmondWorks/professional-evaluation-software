// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";
import { validateData, stressAnalysisSchema, formatZodErrors } from '@/app/lib/validation'; // adjust if your prisma file is elsewhere

// A stress ANOVA run. The org it was filed under came from the body, so anyone
// could write a run into anyone's history — and the history is not just a log:
// the future-requirement prediction fits a line through it.
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;

  try {
    const body = await req.json();

    const parsed = validateData(stressAnalysisSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(parsed.errors!) },
        { status: 400 },
      );
    }

    const {
      group_by,
      ssto,
      sstr,
      sse,
      f_statistic,
      critical_value,
      conclusion,
      df_between,
      df_within,
      ms_between,
      ms_within,
      mean,
      std_dev,
    } = body;

    const result = await prisma.stress_analysis_results.create({
      data: {
        org,
        group_by,
        ssto,
        sstr,
        sse,
        f_statistic,
        critical_value,
        conclusion,
        df_between,
        df_within,
        ms_between,
        ms_within,
        mean,
        std_dev,
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error saving ANOVA result:", error);
    return NextResponse.json(
      { success: false, message: "Error saving ANOVA result" },
      { status: 500 }
    );
  }
}
