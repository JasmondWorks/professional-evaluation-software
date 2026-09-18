// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

// app/api/captureByPaypal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authorize, tokenFromRequest } from "../_lib/authGuard";

// Captures a PayPal order using the app's own merchant credentials, so it must
// not be callable by anyone who has an order id.
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const { orderID } = await req.json();

    // Step 1: Get access token again
    const authRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const { access_token } = await authRes.json();

    // Step 2: Capture payment
    const captureRes = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const captureData = await captureRes.json();

    return NextResponse.json(captureData);
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.json({ error: "Capture failed" }, { status: 500 });
  }
}
