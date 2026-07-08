import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev"; // adjust path if needed

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      org,
      params,
      kmin,
      kmax,
      result,
      violations
    } = body;

    console.log({ org, params, kmin, kmax, result, violations });

    if (!org || !params || !result) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
