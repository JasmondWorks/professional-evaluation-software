// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";

export async function POST(req: NextRequest) {
  try {
    // jwtDecode read this org without checking the signature, so both storing a
    // structure run and reading one back could be pointed at any organization.
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;

    const org = auth.user.org ? String(auth.user.org) : null;
    if (!org) {
      return NextResponse.json({ error: "Missing org in token" }, { status: 400 });
    }

    // Org Structure is downstream of Personnel Utilisation: the structure is
    // derived from the optimal span of control K*, so there is nothing to
    // compute until that model has been run at least once for this org.
    // Client-side gating alone is bypassable by posting here directly.
    const utilisation = await prisma.personnel_utilization.findFirst({
      where: { org },
      select: { id: true },
    });
    if (!utilisation) {
      return NextResponse.json(
        {
          error:
            "Run the Personnel Utilisation model first — the organisation structure is derived from its optimal span of control (K*).",
          code: "PERSONNEL_UTILIZATION_REQUIRED",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      section,
      result,
      numerator = [],
      denominator = [],
      extra_data = {},
    } = body;

    if (!section || result === undefined || result === null) {
      return NextResponse.json(
        { error: "Missing required fields (section or result)" },
        { status: 400 }
      );
    }

    const record = await prisma.org_structure_results.create({
      data: {
        org,
        section: Number(section),
        result: Number(result),
        numerator: numerator.map(Number),
        denominator: denominator.map(Number),
        extra_data,
      },
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (err: any) {
    console.error("Error saving org structure result:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

// Saved section results, newest first. The supervision cost history reads
// section 21 through this: percentage redundancy is computed on that page now,
// but it is still an org-structure result and still lives in the same table.
export async function GET(req: NextRequest) {
  try {
    // jwtDecode read this org without checking the signature, so both storing a
    // structure run and reading one back could be pointed at any organization.
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;

    const org = auth.user.org ? String(auth.user.org) : null;
    if (!org) {
      return NextResponse.json({ error: "Missing org in token" }, { status: 400 });
    }

    const sectionParam = new URL(req.url).searchParams.get("section");
    const section = sectionParam == null ? null : Number(sectionParam);
    if (sectionParam != null && !Number.isFinite(section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    const rows = await prisma.org_structure_results.findMany({
      where: { org, ...(section == null ? {} : { section }) },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        section: r.section,
        result: r.result == null ? null : Number(r.result),
        numerator: r.numerator.map(Number),
        denominator: r.denominator.map(Number),
        extra_data: r.extra_data,
        created_at: r.created_at,
      })),
    );
  } catch (err: any) {
    console.error("Error reading org structure results:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}
