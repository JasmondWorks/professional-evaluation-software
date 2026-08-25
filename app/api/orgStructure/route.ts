import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import prisma from "../prisma.dev";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const decoded: any = jwtDecode(token);
    const org = decoded?.org;
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
