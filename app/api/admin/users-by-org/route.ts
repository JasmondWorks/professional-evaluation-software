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
    where: auth.viewer.isPlatform ? {} : { org_id: auth.viewer.orgId },
    orderBy: { org_id: "asc" },
    select: { ...PUBLIC_USER_COLUMNS, org_id: true },
  });

  // Group users by org_id (equivalent to json_agg + GROUP BY org_id).
  const grouped = new Map<string | null, typeof users>();
  for (const user of users) {
    const list = grouped.get(user.org_id) ?? [];
    list.push(user);
    grouped.set(user.org_id, list);
  }

  const orgIds = Array.from(grouped.keys()).filter(
    (id): id is string => id !== null,
  );
  const orgs = await prisma.org.findMany({
    where: { id: { in: orgIds } },
    select: { id: true, name: true, logo_url: true, category: true, plan: true },
  });
  const orgById = new Map(orgs.map((org) => [org.id, org]));

  const data = Array.from(grouped, ([orgId, users]) => {
    if (orgId === null) {
      return {
        orgId: null,
        orgName: "(unassigned)",
        logoUrl: null,
        category: null,
        plan: null,
        users,
      };
    }
    const org = orgById.get(orgId);
    return {
      orgId,
      orgName: org?.name ?? "(unknown org)",
      logoUrl: org?.logo_url ?? null,
      category: org?.category ?? null,
      plan: org?.plan ?? null,
      users,
    };
  });

  return NextResponse.json(data);
}
