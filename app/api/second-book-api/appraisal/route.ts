export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../prisma.dev";
import { authorize, tokenFromRequest } from "../../_lib/authGuard";

export async function GET(req: Request) {
  // These read staff names, achievements and citations. They were the only
  // functional GET routes in the app and the only ones with no auth on them.
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  // Scoped to the caller's own organization. This table carried no org column
  // until 20261103120000_records_org_scope_and_logos, and this query filtered
  // on category alone — so every organization's book listed every other
  // organization's records. It was invisible only because nothing wrote to the
  // table; the promotion run in app/lib/motivation/records.ts does.
  const orgId = (auth.user as any)?.orgId;
  if (!orgId) {
    return NextResponse.json({ error: "Your account has no organization." }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  try {
    const [records, total] = await Promise.all([
      prisma.second_book_of_record.findMany({
        where: { org_id: orgId, category: "appraisal" },
        orderBy: { date_achieved: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.second_book_of_record.count({ where: { org_id: orgId, category: "appraisal" } }),
    ]);

    const data = records.map((r) => ({
      id: r.id,
      name: r.name,
      title: r.achievement,
      category: r.category,
      subCategory: r.sub_category,
      imageUrl: r.image_url,
      year: r.date_achieved ? new Date(r.date_achieved).getFullYear().toString() : null,
      description: r.description,
    }));

    return NextResponse.json({
      data,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error("❌ Error fetching appraisal records (second book):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
