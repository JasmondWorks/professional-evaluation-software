import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev"; // adjust path if needed
import { authorize, tokenFromRequest } from "../_lib/authGuard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { org, a_ij, lambda, mu, rho, p0, lbar, kmin, kmax, kstar, hstar } =
      body;

    // The rest of the parameter set, stored so the management levels above can
    // be tested against the same boundary conditions. Optional: a run made from
    // the rates alone is still a valid run.
    const numeric = (v: any) =>
      v == null || v === "" || !Number.isFinite(Number(v)) ? null : Number(v);
    const constraints = {
      alpha: numeric(body.alpha),
      y_coef: numeric(body.y_coef),
      w_val: numeric(body.w_val),
      d_val: numeric(body.d_val),
      g_val: numeric(body.g_val),
      j_val: numeric(body.j_val),
      t1: numeric(body.t1),
      t2: numeric(body.t2),
      t3: numeric(body.t3),
      t4: numeric(body.t4),
    };

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
        ...constraints,
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

// Attaching the staff numbers a run was used against.
//
// The client wants the future staff-number prediction to read a K* and its head
// count out of this history alone. A utilization run does not know the head
// count when it is made — the organization structure cascade works that out
// afterwards, from the K* this run produced — so the cascade writes the numbers
// back here when the structure is saved.
export async function PATCH(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {});
    if (!auth.ok) return auth.response;

    const org = auth.user?.org ? String(auth.user.org) : null;
    if (!org) {
      return NextResponse.json(
        { error: "Organization not found in token" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const id = Number(body.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "A run id is required" }, { status: 400 });
    }

    // Scoped by org as well as id, so a run belonging to another organization
    // cannot be written to by guessing its number.
    const updated = await prisma.personnel_utilization.updateMany({
      where: { id, org },
      data: {
        staff_number:
          body.staff_number == null ? null : Number(body.staff_number),
        supervisory_staff:
          body.supervisory_staff == null ? null : Math.round(Number(body.supervisory_staff)),
        management_staff:
          body.management_staff == null ? null : Math.round(Number(body.management_staff)),
        staff_method: body.staff_method == null ? null : String(body.staff_method),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "No such run" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error attaching staff numbers to a utilization run:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
