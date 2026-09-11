import prisma from "../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../_lib/authGuard";
import { consoleViewer } from "../_scope";

export const dynamic = "force-dynamic";

// Every org, with its user count. `org` carries no FK to `pesuser` — the link
// is the `org` string column — so the count is a groupBy joined in memory,
// not a relation count.
export async function GET(req: NextRequest) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;
  if (!auth.viewer.isPlatform) return NextResponse.json({ error: "Platform access required" }, { status: 403 });

  const [orgs, userCounts] = await Promise.all([
    prisma.org.findMany({ orderBy: { name: "asc" } }),
    prisma.pesuser.groupBy({ by: ["org"], _count: { org: true } }),
  ]);

  const counts = new Map(userCounts.map((c) => [c.org, c._count.org]));

  const data = orgs.map((org) => ({
    ...org,
    userCount: counts.get(org.name) ?? 0,
  }));

  return NextResponse.json(data);
}
