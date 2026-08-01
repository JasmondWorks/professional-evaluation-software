import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev"; // adjust path if needed

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { org, a_ij, lambda, mu, rho, p0, lbar, kmin, kmax, kstar, hstar } =
      body;

    if (
      !org ||
      a_ij == null ||
      lambda == null ||
      mu == null ||
      kstar == null ||
      hstar == null
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const saved = await prisma.personnel_utilization.create({
      data: {
        org,
        b: params.B,
        w: params.W,
        p0: params.P0,
        t1: params.t1,
        t2: params.t2,
        t3: params.t3,
        t4: params.t4,
        s0: params.S0,
        g: params.G,
        d: params.D,
        y: params.Y,
        alpha: params.alpha,
        lambda: params.lambda,
        mu: params.mu,
        j: params.J,
        kmin,
        kmax,
        kstar: result.Kstar,
        hstar: result.Hstar,
        constraints_ok: !violations || violations.length === 0,
        violations: violations && violations.length > 0 ? violations : [],
      },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Error saving personnel utilization data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const latest = await prisma.personnel_utilization.findFirst({
      orderBy: { created_at: "desc" },
    });

    if (!latest) {
      return NextResponse.json(
        { message: "No records found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      Kstar: latest.kstar,
      Hstar: latest.hstar ? Number(latest.hstar) : null,
      a_ij: latest.a_ij ? Number(latest.a_ij) : null,
      lambda: latest.lambda ? Number(latest.lambda) : null,
      mu: latest.mu ? Number(latest.mu) : null,
      rho: latest.rho ? Number(latest.rho) : null,
      p0: latest.p0 ? Number(latest.p0) : null,
      lbar: latest.lbar ? Number(latest.lbar) : null,
    });
  } catch (error) {
    console.error("Error fetching personnel utilization data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
