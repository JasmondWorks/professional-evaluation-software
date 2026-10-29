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

  // Two unrelated tables carry a subscription's status, not one. `subscriptions`
  // is written only by the PayPal webhook; `subscriptions_info` is the
  // Paystack-style table that storefront provisioning, plan upgrades, and
  // local-seeding (see app/api/_lib/localSeed.ts) all write to instead. A
  // seeded or Paystack-paid org is real and active but has no `subscriptions`
  // row at all, so reading only that table understates — or for an all-seeded
  // database, zeroes out — this count.
  const [
    orgCount,
    userCount,
    usersByRole,
    activePaypalCount,
    activeInfoCount,
    paypalByStatus,
    infoByStatus,
    plans,
    recentOrgs,
  ] = await Promise.all([
    prisma.org.count(),
    prisma.pesuser.count(),
    prisma.pesuser.groupBy({ by: ["role"], _count: { role: true } }),
    prisma.subscriptions.count({ where: { status: "ACTIVE" } }),
    // Matches the definition /api/subscriptions/active already uses for "paid and current".
    prisma.subscriptions_info.count({ where: { status: { in: ["success", "active"] } } }),
    prisma.subscriptions.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.subscriptions_info.groupBy({ by: ["status"], _count: { status: true } }),
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

  // Combined by status label (lowercased) so the two vocabularies don't show
  // as accidental duplicates if they ever do overlap (e.g. both using "active").
  const combinedStatus = new Map<string, number>();
  for (const s of paypalByStatus) {
    const key = s.status.toLowerCase();
    combinedStatus.set(key, (combinedStatus.get(key) ?? 0) + s._count.status);
  }
  for (const s of infoByStatus) {
    const key = (s.status ?? "pending").toLowerCase();
    combinedStatus.set(key, (combinedStatus.get(key) ?? 0) + s._count.status);
  }

  return NextResponse.json({
    orgCount,
    userCount,
    activeSubCount: activePaypalCount + activeInfoCount,
    usersByRole: usersByRole.map((r) => ({ role: r.role ?? "unassigned", count: r._count.role })),
    subsByStatus: [...combinedStatus.entries()].map(([status, count]) => ({ status, count })),
    plans,
    recentOrgs,
  });
}
