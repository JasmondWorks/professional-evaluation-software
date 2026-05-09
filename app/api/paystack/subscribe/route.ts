import { NextResponse } from "next/server";
import {packages} from "../../../lib/utils/packages"

export async function POST(req: Request) {
  try {
    const { email, planCode } = await req.json();
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

