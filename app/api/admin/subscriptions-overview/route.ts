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
      pesuser: { select: { name: true, email: true, org: true } },
      plans: { select: { name: true, price_cents: true, currency_code: true } },
    },
  });

  // BigInt `id` doesn't survive JSON.stringify.
  const data = subs.map((s) => ({ ...s, id: s.id.toString() }));

  return NextResponse.json(data);
}
