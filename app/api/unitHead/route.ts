import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";
import { validateData, unitHeadSchema, formatZodErrors } from '@/app/lib/validation';

// Stores a unit-head overloading run. `org` came from the body, so the run could
// be filed against any organization by anyone; it now comes from the token.
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();

    const org = auth.user.org ? String(auth.user.org) : null;
    const parsed = validateData(unitHeadSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(parsed.errors!) },
        { status: 400 },
      );
    }

    const {
      actualHours,
      numSubs,
      extraComplexity,
      optimalHours,
      optimalK,
      CF,
      OR,
      status,
    } = body;

    if (!org)
      return NextResponse.json({ error: "Missing org" }, { status: 400 });

    await prisma.unit_head_overloading.create({
      data: {
        org,
        actual_hours: actualHours,
        num_subordinates: numSubs,
        extra_complexity: extraComplexity,
        optimal_hours: optimalHours,
        optimal_k: optimalK || 0,
        complexity_factor: CF,
        overload_ratio: OR,
        status,
      },
    });

    return NextResponse.json({ message: "Record saved successfully" });
  } catch (error) {
    console.error("Error saving unit_head_overloading record:", error);
    return NextResponse.json({ error: "Failed to save record" }, { status: 500 });
  }
}
