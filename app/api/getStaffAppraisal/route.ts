export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../_lib/authGuard";
import prisma from "../prisma.dev";

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
    
    const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    
    const records = await prisma.staff_appraisal_results.findMany({
      where: {
        org: decoded.org,
      },
      orderBy: {
        created_at: "desc",
      }
    });

    return NextResponse.json(records, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching staff appraisal history:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
