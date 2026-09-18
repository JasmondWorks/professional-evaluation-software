// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import {packages} from "../../../lib/utils/packages"
import { authorize, tokenFromRequest } from "../../_lib/authGuard";

// Starts a Paystack checkout. The email is what the webhook later attaches the
// subscription to, so it has to be the caller's own, not a value they typed.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const email = auth.user.email ? String(auth.user.email) : null;
    const { planCode } = await req.json();
    // console.log(packages[planCode])

    // Initialize Paystack subscription
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: 10000, // Amount in kobo (e.g., 10000 kobo = 100 NGN)
        plan: planCode,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription-success`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Subscription initialization failed");
    }

    return NextResponse.json(data.data); // contains authorization_url, reference
  } catch (error: any) {
    console.error("Paystack subscription error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

