import prisma from "../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../_lib/authGuard";
import { consoleViewer } from "../_scope";

// This route queries the DB per request — never prerender/cache it at build time.
export const dynamic = "force-dynamic";

// Platform-wide metrics for the super-admin overview. Org admins get nothing
// here — cross-org aggregates would leak numbers about tenants they don't own.
export async function GET(req: NextRequest) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;
  if (!auth.viewer.isPlatform) return NextResponse.json({ error: "Platform access required" }, { status: 403 });

  const [
    orgCount,
    userCount,
    usersByRole,
    activeSubCount,
    subsByStatus,
    plans,
    recentOrgs,
  ] = await Promise.all([
    prisma.org.count(),
    prisma.pesuser.count(),
    prisma.pesuser.groupBy({ by: ["role"], _count: { role: true } }),
    prisma.subscriptions.count({ where: { status: "ACTIVE" } }),
    prisma.subscriptions.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.plans.findMany({
      where: { is_active: true },
      select: { id: true, name: true, price_cents: true, currency_code: true },
    }),
    prisma.org.findMany({
      orderBy: { created_at: "desc" },
      take: 5,
      select: { id: true, name: true, category: true, plan: true, ongoing: true, created_at: true },
    }),
  ]);

  return NextResponse.json({
    orgCount,
    userCount,
    activeSubCount,
    usersByRole: usersByRole.map((r) => ({ role: r.role ?? "unassigned", count: r._count.role })),
    subsByStatus: subsByStatus.map((s) => ({ status: s.status, count: s._count.status })),
    plans,
    recentOrgs,
  });
}
