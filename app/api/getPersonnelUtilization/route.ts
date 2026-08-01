import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from '../_lib/authGuard'

export async function POST(request: NextRequest) {
  try {
    const auth = authorize(tokenFromRequest(request), {});
    if (!auth.ok) return auth.response;

    const orgName = auth.user.org ? String(auth.user.org) : null;

    if (!orgName) {
      return NextResponse.json({ error: "Organization not found in token" }, { status: 400 });
    }

    const records = await prisma.personnel_utilization.findMany({
      where: { org: orgName },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Error fetching personnel utilization data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
