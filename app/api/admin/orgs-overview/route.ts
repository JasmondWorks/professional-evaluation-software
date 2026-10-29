import prisma from "../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../_lib/authGuard";
import { consoleViewer } from "../_scope";

export const dynamic = "force-dynamic";

// Every org, with its user count. `org` carries no FK to `pesuser` — the link
// is the `org_id` column — so the count is a groupBy joined in memory, not a
// relation count.
//
// Supports either a single lookup (`?id=`, for the org detail page) or a
// searched/filtered/paginated listing (`?q=&plan=&category=&page=&pageSize=`,
// for the organizations table) — filtering and paging happen here, in the
// database, so the result's page and total are accurate regardless of how
// many organizations exist.
export async function GET(req: NextRequest) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;
  if (!auth.viewer.isPlatform) return NextResponse.json({ error: "Platform access required" }, { status: 403 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const q = url.searchParams.get("q")?.trim() || "";
  const plan = url.searchParams.get("plan") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 10));

  const where = {
    ...(id ? { id } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(plan ? { plan } : {}),
    ...(category ? { category } : {}),
  };

  const [total, orgs, userCounts, planFacets, categoryFacets] = await Promise.all([
    prisma.org.count({ where }),
    prisma.org.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.pesuser.groupBy({ by: ["org_id"], _count: { org_id: true } }),
    prisma.org.findMany({ distinct: ["plan"], select: { plan: true } }),
    prisma.org.findMany({ distinct: ["category"], select: { category: true } }),
  ]);

  const counts = new Map(userCounts.map((c) => [c.org_id, c._count.org_id]));

  const data = orgs.map((org) => ({
    ...org,
    userCount: counts.get(org.id) ?? 0,
  }));

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    facets: {
      plans: planFacets.map((p) => p.plan).filter((p): p is string => Boolean(p)),
      categories: categoryFacets.map((c) => c.category).filter((c): c is string => Boolean(c)),
    },
  });
}
