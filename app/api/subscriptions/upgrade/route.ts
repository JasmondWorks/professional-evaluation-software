import { NextRequest, NextResponse } from "next/server";
import prisma from "../../prisma.dev";

export async function POST(req: NextRequest) {
  const { email, oldPlan, newPlan } = await req.json();

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
