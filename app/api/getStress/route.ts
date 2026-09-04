// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";

// Stress submissions. There was no org filter and no auth: POST a name and the
// query ran against every organization's rows at once.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;

  try {
    const body = await req.json();
    const { name } = body;

    const results = await prisma.stress.findMany({
      where: { org, ...(name ? { pesuser_name: name } : {}) },
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
