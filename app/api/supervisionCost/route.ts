import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";

// Supervision Cost (Eq. 8.35) — persists the K* that MINIMISES the wasted
// man-hour cost D_ij, alongside the queueing intermediates used to derive it.
//
// org is taken from the verified token, never from the body: the caller must
// not be able to write results into another organisation's records.

export async function POST(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;

    const org = auth.user?.org;
    if (!org) {
      return NextResponse.json(
        { error: "No organisation on this account" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { a_ij, a_cost, b_cost, lambda, mu, rho, p0, lbar, kmin, kmax, kstar, dstar } =
      body;

    if (
      a_ij == null ||
      a_cost == null ||
      b_cost == null ||
      lambda == null ||
      mu == null ||
      kstar == null ||
      dstar == null
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Eq. 8.9: the boss must serve faster than cases arrive, or the queue
    // never clears and D_ij is undefined.
    if (lambda >= mu) {
      return NextResponse.json(
        { error: "Constraint violated: λ must be less than μ (Eq. 8.9)" },
        { status: 400 },
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;

    const org = auth.user?.org;
    if (!org) {
      return NextResponse.json(
        { error: "No organisation on this account" },
        { status: 403 },
      );
    }

    const latest = await prisma.supervision_cost.findFirst({
      where: { org },
      orderBy: { created_at: "desc" },
    });

    if (!latest) {
      return NextResponse.json({ message: "No records found" }, { status: 404 });
    }

    const num = (v: unknown) => (v == null ? null : Number(v));

    return NextResponse.json({
      Kstar: latest.kstar,
      Dstar: num(latest.dstar),
      a_ij: num(latest.a_ij),
      a_cost: num(latest.a_cost),
      b_cost: num(latest.b_cost),
      lambda: num(latest.lambda),
      mu: num(latest.mu),
      rho: num(latest.rho),
      p0: num(latest.p0),
      lbar: num(latest.lbar),
      created_at: latest.created_at,
    });
  } catch (error) {
    console.error("Error fetching supervision cost data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
