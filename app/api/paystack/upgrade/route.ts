import { NextResponse } from "next/server";
import prisma from "@/app/api/prisma.dev";
import { authorize, tokenFromRequest } from "@/app/api/_lib/authGuard";

// Cancels the caller's current plan ahead of an upgrade. The address came from
// the body, so this was a way to cancel any subscription you knew the email for.
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const email = auth.user.email ? String(auth.user.email) : null;
    const { oldPlan, newPlan } = await req.json();

    if (!email || !oldPlan || !newPlan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.subscriptions_info.updateMany({
      where: {
        pesuser_email: email,
        plan_name: oldPlan.toUpperCase(),
      },
      data: {
        status: 'cancelled',
      },
    });

    return NextResponse.json({ success: true, message: "Old plan cancelled, ready to upgrade" });
  } catch (err) {
    console.error("Upgrade error:", err);
    return NextResponse.json({ error: "Upgrade failed" }, { status: 500 });
  }
}
