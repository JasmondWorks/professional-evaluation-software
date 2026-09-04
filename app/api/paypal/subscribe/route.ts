// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { resolvePackages } from "../../../lib/utils/paypalSetup";
import prisma from "../../prisma.dev";
import { authorize, tokenFromRequest } from "../../_lib/authGuard";

function serialize(obj: any) {
  const result: any = {};
  for (const key in obj) {
    const val = obj[key];
    result[key] = typeof val === 'bigint' ? val.toString() : val;
  }
  return result;
}

// The subscription is created for `userID`, which arrived in the body — so a
// caller could start a plan against somebody else's account.
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const { plan } = await req.json();
    const userID = auth.user.userID;
    if (!plan || !userID) {
      return NextResponse.json({ error: "Plan & userID are required" }, { status: 400 });
    }

    // Resolve local package
    const resolved = await resolvePackages();
    const pkg = resolved[plan];
    if (!pkg) return NextResponse.json({ error: "Invalid plan key" }, { status: 400 });

    // 🔍 Check if user has active subscription
    const activeSubs = await prisma.$queryRaw<any[]>`
      SELECT *
      FROM "subscriptions"
      WHERE pesuser_id = ${userID}
      AND status IN ('ACTIVE', 'APPROVAL_PENDING')
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const accessToken = await (async () => {
      const resp = await fetch(
        `${
          process.env.PAYPAL_SANDBOX === "true"
            ? "https://api-m.sandbox.paypal.com"
            : "https://api-m.paypal.com"
        }/v1/oauth2/token`,
        {
          method: "POST",
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials",
        }
      );
      const j = await resp.json();
      if (!resp.ok) throw new Error("Failed to get PayPal access token");
      return j.access_token;
    })();

    let subscriptionRes: Response;
    let subJson: any;

    if (activeSubs.length > 0) {
      // ⚡ Upgrade scenario
      const oldSub = activeSubs[0];

      subscriptionRes = await fetch(
        `${
          process.env.PAYPAL_SANDBOX === "true"
            ? "https://api-m.sandbox.paypal.com"
            : "https://api-m.paypal.com"
        }/v1/billing/subscriptions/${oldSub.paypal_subscription_id}/revise`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan_id: pkg.planId,
            application_context: {
              brand_name: "My App",
              user_action: "SUBSCRIBE_NOW",
              return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
              cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
            },
          }),
        }
      );

      subJson = await subscriptionRes.json();
      if (!subscriptionRes.ok) {
        console.error("PayPal revise failed:", subJson);
        return NextResponse.json({ error: "PayPal revise failed", details: subJson }, { status: 500 });
      }

      // Update DB old subscription status to upgraded
      await prisma.$executeRaw`
        UPDATE "subscriptions"
        SET status = 'UPGRADED'
        WHERE id = ${oldSub.id}
      `;

    } else {
      // ⚡ New subscription
      subscriptionRes = await fetch(
        `${
          process.env.PAYPAL_SANDBOX === "true"
            ? "https://api-m.sandbox.paypal.com"
            : "https://api-m.paypal.com"
        }/v1/billing/subscriptions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan_id: pkg.planId,
            application_context: {
              brand_name: "My App",
              user_action: "SUBSCRIBE_NOW",
              return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
              cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
            },
          }),
        }
      );

      subJson = await subscriptionRes.json();
      if (!subscriptionRes.ok) {
        console.error("PayPal subscription failed:", subJson);
        return NextResponse.json({ error: "Subscription creation failed", details: subJson }, { status: 500 });
      }
    }

    // Insert new subscription record
    const inserted = await prisma.$queryRaw<any[]>`
      INSERT INTO "subscriptions" (
        pesuser_id,
        plan_id,
        paypal_subscription_id,
        status,
        metadata,
        created_at,
        updated_at
      )
      VALUES (
        ${userID},
        (SELECT id FROM "plans" WHERE name = ${pkg.name} LIMIT 1),
        ${subJson.id},
        ${subJson.status},
        ${JSON.stringify({ planId: pkg.planId, links: subJson.links })}::jsonb,
        now(),
        now()
      )
      RETURNING *
    `;

    return NextResponse.json({ subscription: serialize(inserted[0]), paypal: subJson });

  } catch (err) {
    console.error("PayPal subscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
