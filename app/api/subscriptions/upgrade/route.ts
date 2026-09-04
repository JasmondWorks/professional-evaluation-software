// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import prisma from "../../prisma.dev";
import { authorize, tokenFromRequest } from "../../_lib/authGuard";

// The email said whose subscription to touch, and nothing checked that it was
// the caller's. It comes off the token now; a subscription is not something you
// should be able to alter by knowing somebody's address.
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const email = auth.user.email ? String(auth.user.email) : null;
  if (!email) {
    return NextResponse.json({ error: "No email on this account" }, { status: 403 });
  }

  const { oldPlan, newPlan } = await req.json();

  const current = await prisma.$queryRaw<any[]>`
    SELECT *
    FROM subscriptions_info
    WHERE pesuser_email = ${email}
    AND status = 'active'
    LIMIT 1
  `;

  if (!current.length) {
    return NextResponse.json({ error: "No active subscription" }, { status: 404 });
  }

  const sub = current[0];

  // DO NOT expire yet
  // mark upgrade intent only

  await prisma.$executeRaw`
    UPDATE subscriptions_info
    SET
      status = 'upgrade_pending',
      next_plan = ${newPlan}
    WHERE id = ${sub.id}
  `;

  return NextResponse.json({
    ok: true,
    provider: sub.provider,
    provider_subscription_id: sub.provider_subscription_id
  });
}
