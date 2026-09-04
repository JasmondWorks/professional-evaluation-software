// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { verifyToken } from "../_lib/authGuard";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const org = decoded.org;

    const body = await req.json();
    const { user_name } = body;

    if (!user_name || !org) {
      return NextResponse.json(
        { error: "user_name and org are required" },
        { status: 400 }
      );
    }

    console.log("Fetching stress scores for:", { user_name, org });

    const row = await prisma.stress_scores.findFirst({
      where: { user_name, org },
      select: {
        organizational: true,
        student: true,
        administrative: true,
        teacher: true,
        parents: true,
        occupational: true,
        personal: true,
        academic_program: true,
        negative_public_attitude: true,
        misc: true,
      },
    });

    if (!row) {
      return NextResponse.json(
        { error: "No stress scores found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: row }, { status: 200 });
  } catch (error) {
    console.error("Error fetching stress scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stress scores" },
      { status: 500 }
    );
  }
}
