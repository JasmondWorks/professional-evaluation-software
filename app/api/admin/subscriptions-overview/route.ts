import prisma from "../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../_lib/authGuard";
import { consoleViewer } from "../_scope";

export const dynamic = "force-dynamic";

// All PayPal subscriptions across every org, for the platform revenue view.
export async function GET(req: NextRequest) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;
  if (!auth.viewer.isPlatform) return NextResponse.json({ error: "Platform access required" }, { status: 403 });

  const subs = await prisma.subscriptions.findMany({
    orderBy: { created_at: "desc" },
    take: 200,
    select: {
      id: true,
      status: true,
      start_time: true,
      next_billing_time: true,
      failed_payment_count: true,
      created_at: true,
      pesuser: { select: { name: true, email: true, org_id: true } },
      plans: { select: { name: true, price_cents: true, currency_code: true } },
    },
  });

  const orgIds = [...new Set(subs.map((s) => s.pesuser?.org_id).filter((id): id is number => id != null))];
  const orgs = await prisma.org.findMany({ where: { id: { in: orgIds } }, select: { id: true, name: true } });
  const orgNameById = new Map(orgs.map((o) => [o.id, o.name]));

  // BigInt `id` doesn't survive JSON.stringify.
  const data = subs.map((s) => ({
    ...s,
    id: s.id.toString(),
    pesuser: s.pesuser
      ? { name: s.pesuser.name, email: s.pesuser.email, org: orgNameById.get(s.pesuser.org_id!) ?? null }
      : null,
  }));

  return NextResponse.json(data);
}
