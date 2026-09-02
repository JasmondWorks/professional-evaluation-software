import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "../../prisma.dev";

// Receives Resend delivery events and records email deliverability on pesuser
// (delivered | bounced | complained). A "bounced" address is then flagged as
// undeliverable in the Employee UI — closing the loop on typo'd addresses that
// look valid but don't exist.
//
// Setup (Resend dashboard → Webhooks):
//   • Endpoint: https://<your-app>/api/webhooks/resend
//   • Events: email.delivered, email.bounced, email.complained
//   • Copy the signing secret into RESEND_WEBHOOK_SECRET (whsec_...).

// Deliberately public: Resend calls this. Authenticated by the Svix signature
// over the raw body.
export async function POST(req: Request) {
  // Raw body is required for signature verification.
  const raw = await req.text();

  // Verify the Svix signature Resend sends (when a secret is configured).
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (secret) {
    const id = req.headers.get("svix-id") || "";
    const ts = req.headers.get("svix-timestamp") || "";
    const sig = req.headers.get("svix-signature") || "";
    try {
      const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
      const expected = crypto
        .createHmac("sha256", key)
        .update(`${id}.${ts}.${raw}`)
        .digest("base64");
      // svix-signature is a space-separated list of "v1,<base64sig>".
      const ok = sig.split(" ").some((part) => part.split(",")[1] === expected);
      if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    } catch {
      return NextResponse.json({ error: "Signature check failed" }, { status: 401 });
    }
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const type: string = event?.type || "";
  const recipients: string[] = Array.isArray(event?.data?.to)
    ? event.data.to
    : event?.data?.to
      ? [event.data.to]
      : [];

  const statusByType: Record<string, string> = {
    "email.delivered": "delivered",
    "email.bounced": "bounced",
    "email.complained": "complained",
  };
  const status = statusByType[type];

  // Only act on the events we track, and only for known recipients.
  if (status && recipients.length > 0) {
    try {
      await prisma.pesuser.updateMany({
        where: { email: { in: recipients } },
        data: { email_status: status, email_status_at: new Date() },
      });
    } catch (err) {
      console.error("resend webhook update failed:", err);
      // Still 200 so Resend doesn't retry forever on our DB hiccup.
    }
  }

  return NextResponse.json({ received: true });
}
