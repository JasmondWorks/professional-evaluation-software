import prisma from "../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { authorize, tokenFromRequest } from "../../_lib/authGuard";

// This route queries the DB per request — never prerender/cache it at build time.
export const dynamic = "force-dynamic";

// Every user in every organization: the platform console's roster. It had no
// auth and no `select`, so it served the whole `pesuser` table — password
// hashes included — to anyone who asked.
export async function GET(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), { roles: ["super-admin"], allowAdmins: false });
  if (!auth.ok) return auth.response;

  const users = await prisma.pesuser.findMany({
    orderBy: { org: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      org: true,
      dept: true,
      gsm: true,
      address: true,
      image: true,
      audit_count: true,
    },
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
