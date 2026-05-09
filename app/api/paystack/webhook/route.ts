import { NextRequest, NextResponse } from "next/server";
import prisma from "../../prisma.dev";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();

    // 🔐 verify Paystack signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(raw)
      .digest("hex");

    if (hash !== req.headers.get("x-paystack-signature")) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(raw);

    if (body.event !== "charge.success") {
      return NextResponse.json({ ok: true });
    }

    const d = body.data;

    const email = d.customer.email;
    const reference = d.reference;
    const amount = d.amount / 100;
    const planCode = d.plan?.plan_code;
    const planName = d.plan?.name;
    const paidAt = new Date(d.paid_at);

    console.log("🔥 PAYMENT SUCCESS:", email, planCode);

    // ✅ check active subscription
    const current = await prisma.$queryRaw<any[]>`
      SELECT id
      FROM subscriptions_info
      WHERE pesuser_email = ${email}
      AND status = 'success'
      AND expires_at > NOW()
      LIMIT 1
    `;

    // ✅ upgrade case
    if (current.length) {
      await prisma.$executeRaw`
        UPDATE subscriptions_info
        SET status = 'upgraded',
            expires_at = NOW(),
            replaced_by = ${reference}
        WHERE id = ${current[0].id}
      `;

      console.log("⬆️ Upgraded previous plan");
    }

    // ✅ insert new plan (idempotent)
    await prisma.$executeRaw`
      INSERT INTO subscriptions_info (
        pesuser_email,
        plan_code,
        plan_name,
        reference,
        status,
        amount,
        paid_at,
        created_at,
        started_at,
        expires_at
      )
      VALUES (
        ${email},
        ${planCode},
        ${planName},
        ${reference},
        'success',
        ${amount},
        ${paidAt},
        NOW(),
        NOW(),
        NOW() + interval '1 year'
      )
      ON CONFLICT (reference) DO NOTHING
    `;

    console.log("✅ Subscription recorded");

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("❌ webhook error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
