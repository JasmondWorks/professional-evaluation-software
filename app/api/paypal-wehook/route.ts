import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";

// ✅ verify webhook using PayPal API
async function verifyWebhook(
  bodyText: string,
  request: NextRequest,
  webhookId: string
): Promise<boolean> {
  const certUrl = request.headers.get("paypal-cert-url");
  const authAlgo = request.headers.get("paypal-auth-algo");
  const transmissionId = request.headers.get("paypal-transmission-id");
  const transmissionTime = request.headers.get("paypal-transmission-time");
  const transmissionSig = request.headers.get("paypal-transmission-sig");

  if (!certUrl || !authAlgo || !transmissionId || !transmissionTime || !transmissionSig) {
    console.error("Missing PayPal headers");
    return false;
  }

  // 🔐 get access token
  const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error("PayPal token error:", tokenJson);
    return false;
  }

  const accessToken = tokenJson.access_token;

  // 🔎 verify signature
  const verifyRes = await fetch(
    "https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: JSON.parse(bodyText),
      }),
    }
  );

  const verifyJson = await verifyRes.json();
  return verifyRes.ok && verifyJson.verification_status === "SUCCESS";
}

// Deliberately public: a PayPal webhook, authenticated by signature.
export async function POST(req: NextRequest) {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID!;
    const bodyText = await req.text();
    const webhookEvent = JSON.parse(bodyText);

    // ✅ verify signature
    const isValid = await verifyWebhook(bodyText, req, webhookId);
    if (!isValid) {
      console.error("❌ Invalid PayPal webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const eventType = webhookEvent.event_type;
    const resource = webhookEvent.resource;

    console.log("📩 PayPal event:", eventType);

    // =====================================================
    // SUBSCRIPTION CREATED / ACTIVATED  (UPGRADE-AWARE)
    // =====================================================

    if (
      eventType === "BILLING.SUBSCRIPTION.CREATED" ||
      eventType === "BILLING.SUBSCRIPTION.ACTIVATED"
    ) {
      const subscriptionId = resource.id;
      const planId = resource.plan_id;
      const status = resource.status;

      const payerEmail =
        resource.subscriber?.email_address ?? "unknown@example.com";

      const payerName =
        `${resource.subscriber?.name?.given_name ?? ""} ${
          resource.subscriber?.name?.surname ?? ""
        }`.trim() || "Unknown";

      const amountValue =
        resource.billing_info?.last_payment?.amount?.value ??
        resource.plan?.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.value ??
        "0.00";

      const paidTime =
        resource.billing_info?.last_payment?.time ??
        resource.create_time ??
        new Date().toISOString();

      // 🔍 check existing active subscription
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM subscriptions_info
        WHERE pesuser_email = ${payerEmail}
        AND status = 'success'
        AND expires_at > NOW()
        LIMIT 1
      `;

      // 🔁 mark upgrade if exists
      if (existing.length) {
        await prisma.$executeRaw`
          UPDATE subscriptions_info
          SET status = 'upgraded',
              expires_at = NOW(),
              replaced_by = ${subscriptionId}
          WHERE id = ${existing[0].id}
        `;
        console.log("⬆️ Existing plan upgraded for", payerEmail);
      }

      // 💾 insert new subscription
      await prisma.$executeRaw`
        INSERT INTO subscriptions_info (
          pesuser_email,
          pesuser_name,
          org,
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
          ${payerEmail},
          ${payerName},
          'N/A',
          ${planId},
          'PAYPAL_PLAN',
          ${subscriptionId},
          'success',
          ${Number(amountValue)},
          ${paidTime},
          now(),
          now(),
          now() + interval '1 year'
        )
        ON CONFLICT (reference) DO NOTHING
      `;
    }

    // =====================================================
    // PAYMENT SUCCESS
    // =====================================================

    if (
      eventType === "BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED" ||
      eventType === "PAYMENT.SALE.COMPLETED"
    ) {
      const subId = resource.billing_agreement_id ?? resource.id;
      const paidTime =
        resource.update_time ?? resource.create_time ?? new Date().toISOString();

      await prisma.$executeRaw`
        UPDATE subscriptions_info
        SET status = 'success',
            paid_at = ${paidTime},
            updated_at = now()
        WHERE reference = ${subId}
      `;

      console.log("💰 Payment success:", subId);
    }

    // =====================================================
    // CANCELLED
    // =====================================================

    if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
      const subId = resource.id;

      await prisma.$executeRaw`
        UPDATE subscriptions_info
        SET status = 'cancelled',
            updated_at = now()
        WHERE reference = ${subId}
      `;

      console.log("🛑 Subscription cancelled:", subId);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("🔥 PayPal webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
