import prisma from "../../prisma.dev";
import { NextResponse } from "next/server";

// This route queries the DB per request — never prerender/cache it at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  const users = await prisma.pesuser.findMany({ orderBy: { org: "asc" } });

  // Group users by org (equivalent to json_agg + GROUP BY org).
  const grouped = new Map<string | null, typeof users>();
  for (const user of users) {
    const list = grouped.get(user.org) ?? [];
    list.push(user);
    grouped.set(user.org, list);
  }

  const data = Array.from(grouped, ([org, users]) => ({ org, users }));

  return NextResponse.json(data);
}