// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { verifyToken } from "../_lib/authGuard";
import { requireEntitlement } from "../_lib/planGuard";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let org;
    // Kept alongside `org` because the plan lookup needs the category and tier
    // claims too, and `decoded` does not outlive the block below.
    let claims: any = null;
    try {
      const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      claims = decoded;
      org = decoded?.org;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!org) return NextResponse.json({ error: "Org missing in token" }, { status: 400 });

    const plan = await requireEntitlement(claims, 'personnel-utilization.unit-head-overloading');
    if (!plan.ok) return plan.response;

    if (!org) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    const records = await prisma.unit_head_overloading.findMany({
      where: { org },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(records);
  } catch (err: any) {
    console.error("Error fetching unit head history:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
