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

    const num = (v: unknown) => (v == null ? null : Number(v));

    // ?latest=1 returns the single most recent run (for pre-filling the form);
    // the default is the full run history, which is what the history page shows.
    const latestOnly = req.nextUrl.searchParams.get("latest") === "1";

    const rows = await prisma.supervision_cost.findMany({
      where: { org },
      orderBy: { created_at: "desc" },
      ...(latestOnly ? { take: 1 } : {}),
    });

    const shaped = rows.map((r) => ({
      id: r.id,
      Kstar: r.kstar,
      Dstar: num(r.dstar),
      a_ij: num(r.a_ij),
      a_cost: num(r.a_cost),
      b_cost: num(r.b_cost),
      lambda: num(r.lambda),
      mu: num(r.mu),
      rho: num(r.rho),
      p0: num(r.p0),
      lbar: num(r.lbar),
      created_at: r.created_at,
    }));

    if (latestOnly) {
      if (shaped.length === 0) {
        return NextResponse.json({ message: "No records found" }, { status: 404 });
      }
      return NextResponse.json(shaped[0]);
    }

    return NextResponse.json(shaped);
  } catch (error) {
    console.error("Error fetching supervision cost data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
