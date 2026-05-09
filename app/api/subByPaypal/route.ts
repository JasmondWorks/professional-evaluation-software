// app/api/createSubscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resolvePackages } from "../../lib/utils/paypalSetup";
import prisma from "../prisma.dev"; // assuming you have prisma client set up
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

export async function POST(req: NextRequest) {
  try {
    const { plan, userID } = await req.json();
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
    console.log(pkg.name)

    // Insert into your subscriptions table using $queryRaw, using userID passed in
    // Here, for simplicity, assume `plan` variable matches a local plan key and you have a table "plans" with column "key" that stores that.
    const planRow = await prisma.$queryRaw<
      Array<{ id: string }>
    >`SELECT id FROM "plans" WHERE name = ${pkg.name} LIMIT 1`;

    if (!planRow || planRow.length === 0) {
      return NextResponse.json({ error: "Plan not found in database" }, { status: 500 });
    }
    const localPlanId = planRow[0].id;
    
    console.log(localPlanId)

    // Now insert into subscriptions
    const inserted = await prisma.$queryRaw<
      Array<{
        id: string;
        pesuser_id: string;
        plan_id: UUID;
        paypal_subscription_id: string;
        status: string;
        start_time: Date | null;
        metadata: JSON;
        created_at: Date;
        updated_at: Date;
      }>
    >`
      INSERT INTO "subscriptions" (
        pesuser_id,
        plan_id,
        paypal_subscription_id,
        status,
        start_time,
        metadata,
        created_at,
        updated_at
      )
      VALUES (
        ${userID},
        ${localPlanId}::uuid,
        ${paypalSubId},
        ${status},
        ${startTime ? new Date(startTime) : null},
        ${metadataJson}::jsonb,
        now(),
        now()
      )
      RETURNING *
    `;

    const createdSub = inserted[0];

    return NextResponse.json({
      subscription: serialize(createdSub),
      paypal: subJson,
    });

  } catch (err) {
    console.error("createSubscription error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

