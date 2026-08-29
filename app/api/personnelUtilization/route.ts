import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev"; // adjust path if needed
import { authorize, tokenFromRequest } from "../_lib/authGuard";

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

    // The queue is only stable while arrivals trail service. Rows that break the
    // rule are not merely wrong on their own row — the history feeds the staff
    // prediction, so one bad K* skews every extrapolation drawn through it. The
    // form blocks this too; this is the check that actually holds.
    if (!(Number(lambda) < Number(mu))) {
      return NextResponse.json(
        { error: "λ must be strictly less than μ." },
        { status: 400 },
      );
    }

    const saved = await prisma.personnel_utilization.create({
      data: {
        org,
        a_ij,
        lambda,
        mu,
        rho,
        p0,
        lbar,
        kmin,
        kmax,
        kstar,
        hstar,
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
    // This used to take the newest row in the table with no org filter at all,
    // so one organization's latest run was handed to whoever asked next. The
    // org now comes from the token and scopes the query.
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;

    const org = auth.user?.org ? String(auth.user.org) : null;
    if (!org) {
      return NextResponse.json(
        { error: "Organization not found in token" },
        { status: 400 },
      );
    }

    const latest = await prisma.personnel_utilization.findFirst({
      where: { org },
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
