import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, amountNaira } = await req.json();
    if (!email || !amountNaira) return NextResponse.json({ message: "Missing email or amount" }, { status: 400 });

    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    const callback_url = `${process.env.NEXT_PUBLIC_APP_URL || ""}/maintenance-payment`;

    const body = {
      email,
      amount: Number(amountNaira) * 100, // convert Naira to kobo
      callback_url,
    };

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ message: data?.message || "Paystack init failed", data }, { status: 500 });
    }

    // return authorization_url and reference to client
    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err?.message || "Initialization error" }, { status: 500 });
  }
}