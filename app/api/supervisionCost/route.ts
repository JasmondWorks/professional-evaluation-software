import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      org,
      a_ij,
      a_cost,
      b_cost,
      lambda,
      mu,
      rho,
      p0,
      lbar,
      kmin,
      kmax,
      kstar,
      dstar,
    } = body;

    if (!org || a_ij == null || a_cost == null || b_cost == null || lambda == null || mu == null || kstar == null || dstar == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate Eq. 8.9: λ < μ
    if (lambda >= mu) {
      return NextResponse.json(
        { error: "Constraint violated: λ must be less than μ (Eq. 8.9)" },
        { status: 400 }
      );
    }

    const saved = await prisma.supervision_cost.create({
      data: {
        org,
        a_ij,
        a_cost,
        b_cost,
        lambda,
        mu,
        rho,
        p0,
        lbar,
        kmin,
        kmax,
        kstar,
        dstar,
      },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Error saving supervision cost data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const org = req.nextUrl.searchParams.get("org");

    const latest = await prisma.supervision_cost.findFirst({
      where: org ? { org } : undefined,
      orderBy: { created_at: "desc" },
    });

    if (!latest) {
      return NextResponse.json({ message: "No records found" }, { status: 404 });
    }

    return NextResponse.json({
      Kstar: latest.kstar,
      Dstar: latest.dstar ? Number(latest.dstar) : null,
      a_ij: latest.a_ij ? Number(latest.a_ij) : null,
      a_cost: latest.a_cost ? Number(latest.a_cost) : null,
      b_cost: latest.b_cost ? Number(latest.b_cost) : null,
      lambda: latest.lambda ? Number(latest.lambda) : null,
      mu: latest.mu ? Number(latest.mu) : null,
      rho: latest.rho ? Number(latest.rho) : null,
      p0: latest.p0 ? Number(latest.p0) : null,
      lbar: latest.lbar ? Number(latest.lbar) : null,
    });
  } catch (error) {
    console.error("Error fetching supervision cost data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
