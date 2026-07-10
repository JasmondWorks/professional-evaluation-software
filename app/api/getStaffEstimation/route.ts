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

    const records = await prisma.staffEstimation.findMany({
      where: { org: decoded.org },
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
