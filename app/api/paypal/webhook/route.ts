import { NextRequest, NextResponse } from "next/server";
import prisma from "../../prisma.dev"; // your Prisma client
import crypto from "crypto";

async function verifyWebhook(request: NextRequest, webhookId: string): Promise<boolean> {
  const certUrl = request.headers.get("paypal-cert-url")!;
  const authAlgo = request.headers.get("paypal-auth-algo")!;
  const transmissionId = request.headers.get("paypal-transmission-id")!;
  const transmissionTime = request.headers.get("paypal-transmission-time")!;
  const webhookEventBody = await request.text();
  const transmissionSig = request.headers.get("paypal-transmission-sig")!;

  // ====== Get Access Token ======
  const resp = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const j = await resp.json();
  if (!resp.ok) throw new Error("Could not fetch access token");
  const accessToken = j.access_token;

  // ====== Verify Webhook Signature ======
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
        webhook_event: JSON.parse(webhookEventBody),
      }),
    }
  );

  const verifyJson = await verifyRes.json();
  return verifyRes.ok && verifyJson.verification_status === "SUCCESS";
}

// Deliberately public: PayPal calls this. Authenticated by signature, verified
// against PayPal's verify-webhook-signature endpoint.
export async function POST(req: NextRequest) {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID!;
    const bodyText = await req.text();
    const webhookEvent = JSON.parse(bodyText);

    const isValid = await verifyWebhook(req, webhookId);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const eventType = webhookEvent.event_type;
    const resource = webhookEvent.resource;
    console.log("Received PayPal webhook:", eventType);

    // ===== Handle Event Types =====
    switch (eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const subscriptionId = resource.id;
        const status = resource.status;
        const startTime = resource.start_time || new Date().toISOString();
        const planId = resource.plan_id;
        const amountValue =
          resource.billing_info?.last_payment?.amount?.value ||
          resource.plan?.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.value ||
          "0.00";
        const payerEmail =
          resource.subscriber?.email_address || "unknown@example.com";
        const payerName =
          resource.subscriber?.name?.given_name +
            " " +
            resource.subscriber?.name?.surname || "Unknown";

        // ✅ Save to your subscriptions_info table
        await prisma.$executeRaw`
          INSERT INTO subscriptions_info (
            pesuser_email, pesuser_name, org, plan_code, plan_name,
            reference, status, amount, paid_at, created_at
          )
          VALUES (
            ${payerEmail},
            ${payerName},
            'N/A',
            ${planId},
            'PAYPAL_PLAN',
            ${subscriptionId},
            ${status},
            ${Number(amountValue)},
            ${startTime},
            now()
          )
        `;
        break;
      }

      case "BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED":
      case "PAYMENT.SALE.COMPLETED": {
        const subscriptionId = resource.billing_agreement_id ?? resource.id;
        const lastBillingTime = resource.update_time ?? resource.create_time ?? new Date().toISOString();

        await prisma.$executeRaw`
          UPDATE subscriptions_info
          SET status = 'success',
              paid_at = ${lastBillingTime},
              updated_at = now()
          WHERE reference = ${subscriptionId}
        `;
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED": {
        const subscriptionId = resource.id;
        await prisma.$executeRaw`
          UPDATE subscriptions_info
          SET status = 'cancelled',
              updated_at = now()
          WHERE reference = ${subscriptionId}
        `;
        break;
      }

      default:
        console.log("Unhandled event type:", eventType);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("PayPal webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
