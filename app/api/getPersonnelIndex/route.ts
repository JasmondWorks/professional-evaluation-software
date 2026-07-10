export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { jwtDecode } from "jwt-decode";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header missing" },
        { status: 401 }
      );
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 401 });
    }
    
    const decoded = jwtDecode<{ org: string }>(token);
    const org = decoded.org;
    
    if (!org) {
      return NextResponse.json({ error: "Organization missing" }, { status: 400 });
    }

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');

    let whereClause: any = { org };
    if (type === 'productivity') whereClause.productivity = { not: null };
    if (type === 'redundancy') whereClause.redundancy = { not: null };
    if (type === 'utility') whereClause.utility = { not: null };

    const records = await prisma.index.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(records);
  } catch (err: any) {
    console.error("Error fetching index history:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
