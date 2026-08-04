import { NextResponse } from "next/server";
import prisma from "@/app/api/prisma.dev";

export async function POST(req: Request) {
  try {
    const { email, oldPlan, newPlan } = await req.json();

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
