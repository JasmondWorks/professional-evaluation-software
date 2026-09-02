// app/api/createSubscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resolvePackages } from "../../lib/utils/paypalSetup";
import prisma from "../prisma.dev"; // assuming you have prisma client set up
import { authorize, tokenFromRequest } from "../_lib/authGuard";
import { UUID } from "crypto";

function serialize(obj: any) {
  const result: any = {};
  for (const key in obj) {
    const val = (obj as any)[key];
    if (typeof val === 'bigint') {
      result[key] = val.toString();
    } else {
      result[key] = val;
    }
  }
  return result;
}

// Same as paypal/subscribe: the account the plan is created for came from the
// body rather than the token.
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const { plan } = await req.json();
    const userID = auth.user.userID;
    if (!plan || !userID) {
      return NextResponse.json({ error: "Plan & userID are required" }, { status: 400 });
    }

    const resolved = await resolvePackages();
    const pkg = resolved[plan];
    if (!pkg) {
      return NextResponse.json({ error: "Invalid plan key" }, { status: 400 });
    }

    // Get access token from PayPal
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
              Buffer.from(
                `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
              ).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials",
        }
      );
      const j = await resp.json();
      if (!resp.ok) {
        console.error("PayPal token error:", j);
        throw new Error("Failed to get PayPal access token");
      }
      return j.access_token;
    })();

    // Create subscription in PayPal
    const subscriptionRes = await fetch(
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
          // subscriber: {
          //   email_address: email,  // optional, but useful to pass
          // },
          application_context: {
            brand_name: "My App",
            user_action: "SUBSCRIBE_NOW",
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
          },
        }),
      }
    );

    const subJson = await subscriptionRes.json();

    if (!subscriptionRes.ok) {
      console.error("Error creating subscription:", subJson);
      return NextResponse.json(
        { error: "Subscription creation failed", details: subJson },
        { status: 500 }
      );
    }

    // Extract fields from PayPal response
    const {
      id: paypalSubId,
      status,
      start_time: startTime,      // might be undefined / null
      plan_id: paypalPlanId,       // the PayPal plan id
      links,
      // other fields if needed
    } = subJson;

    // Prepare metadata (optional but useful)
    const metadata = {
      paypalPlanId,
      links,
      // subscriber_email: email,
      // you can include whole subJson if needed, but consider size
    };

    const metadataJson = JSON.stringify(metadata);

    // Record the subscription locally — best-effort. A bookkeeping failure here
    // must NOT fail the actual PayPal subscription (the payment already exists).
    let createdSub: any = null;
    try {
      const planRow = await prisma.plans.findFirst({
        where: { name: pkg.name }
      });

      if (planRow) {
        const localPlanId = planRow.id;
        
        createdSub = await prisma.subscriptions.create({
          data: {
            pesuser_id: Number(userID),
            plan_id: localPlanId,
            paypal_subscription_id: paypalSubId,
            status: status,
            start_time: startTime ? new Date(startTime) : null,
            metadata: metadata, // Passing the JSON object directly to JSONB column
            created_at: new Date(),
            updated_at: new Date(),
          }
        });
      } else {
        console.warn("subByPaypal: no local plan row for", pkg.name);
      }
    } catch (dbErr) {
      console.error("subByPaypal: failed to record subscription locally:", dbErr);
    }

    // Always return the PayPal subscription so the SDK can proceed to approval.
    return NextResponse.json({
      subscription: createdSub ? serialize(createdSub) : null,
      paypal: subJson,
    });

  } catch (err: any) {
    console.error("createSubscription error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}

