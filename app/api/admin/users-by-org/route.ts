import prisma from "../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../_lib/authGuard";
import { consoleViewer, PUBLIC_USER_COLUMNS } from "../_scope";

// This route queries the DB per request — never prerender/cache it at build time.
export const dynamic = "force-dynamic";

// The console's roster, grouped by organization. It had no auth and no `select`,
// so it served the whole pesuser table — password hashes included — to anyone
// who asked. The platform operator still sees every org; an org admin sees the
// single group for their own.
export async function GET(req: NextRequest) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

  const users = await prisma.pesuser.findMany({
    where: auth.viewer.isPlatform ? {} : { org: auth.viewer.org },
    orderBy: { org: "asc" },
    select: PUBLIC_USER_COLUMNS,
  });

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
