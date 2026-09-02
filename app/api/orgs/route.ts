export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { authorize, tokenFromRequest } from "../_lib/authGuard";
import prisma from "../prisma.dev";

// Lists organizations. It imported verifyToken and never called it, so it
// returned the name of every tenant on the platform to anyone who asked — a
// list of exactly the org strings the other routes scope by.
export async function GET(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    // Only the platform operator has business seeing the whole list; everyone
    // else sees the one they belong to.
    const orgs = await prisma.org.findMany({
      where:
        auth.user.role === "super-admin"
          ? {}
          : { name: auth.user.org ? String(auth.user.org) : " " },
      select: { id: true, name: true },
    });
    return NextResponse.json(orgs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch orgs" }, { status: 500 });
  }
}
