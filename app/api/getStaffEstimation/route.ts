export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";
import { requireModel } from '../_lib/planGuard';

export async function GET(req: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(req), {
      roles: ["industrial-engineer"],
      anyOf: ["can_define_performance_metrics"],
    });
    if (!auth.ok) return auth.response;
    const plan = await requireModel(auth.user, 'staff-number');
    if (!plan.ok) return plan.response;

    const records = await prisma.staffEstimation.findMany({
      where: { org: auth.user.org ?? undefined },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(records);
  } catch (err: any) {
    console.error("Error fetching staff estimation history:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
