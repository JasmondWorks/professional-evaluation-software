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

    // Validate input
    if (!org || typeof org !== 'string') {
      return NextResponse.json({ error: "Invalid org parameter" }, { status: 400 });
    }

    const results = await prisma.stress.findMany({
      where: { org },
      select: {
        pesuser_name: true,
        dept: true,
        stress_theme: true,
        stress_feeling_frequency: true,
      },
    });

    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching stress data:", err);
    return NextResponse.json({ error: "Failed to fetch stress" }, { status: 500 });
  }
}
