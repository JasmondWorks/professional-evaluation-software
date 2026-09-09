export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";
import { planViewer } from "../_lib/planGuard";
import { resolveEntitlements } from "@/app/lib/billing/access";

// Stress evaluation history, scoped to the caller's organization. The org was read with jwtDecode,
// which decodes without checking the signature, so a token written by hand named
// any org it liked and this returned that org's records.
export async function GET(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;
  if (!org) {
    return NextResponse.json(
      { error: "This account is not attached to an organization" },
      { status: 403 }
    );
  }

  try {
    
    const records = await prisma.stress_evaluation_history.findMany({
      where: {
        org,
      },
      orderBy: {
        created_at: "desc",
      }
    });

    // The stress model sells at every tier, but the time-pressure and conflict
    // indices are Premium lines in the product plan. The record holds all three
    // together, so the two that were not bought are withheld here rather than
    // the whole history being refused.
    const viewer = planViewer(auth.user);
    const keys = viewer ? (await resolveEntitlements(viewer)).keys : new Set<string>();
    const visible = records.map((r) => ({
      ...r,
      pressure_factor: keys.has("stress.time-pressure") ? r.pressure_factor : null,
      conflict_factor: keys.has("stress.conflict") ? r.conflict_factor : null,
    }));

    return NextResponse.json(visible, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching stress evaluation history:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
