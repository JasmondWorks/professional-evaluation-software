import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = jwt.decode(token);
    let orgName: string | null = null;
    
    if (typeof user === "object" && user !== null && "org" in user) {
      orgName = (user as { org?: string }).org ?? null;
    }

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
