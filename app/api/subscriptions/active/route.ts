import { NextRequest, NextResponse } from "next/server";
import prisma from "../../prisma.dev";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  try {
    const activeSub = await prisma.$queryRaw<
      any[]
    >`
      SELECT *
      FROM subscriptions_info
      WHERE pesuser_email = ${email}
      AND status IN ('success', 'active')
      AND expires_at > NOW()
      ORDER BY expires_at DESC
      LIMIT 1
    `;

    if (!activeSub || activeSub.length === 0) {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({
      active: true,
      plan: activeSub[0].plan_name,
      expires_at: activeSub[0].expires_at,
      data: activeSub[0],
    });

  } catch (err) {
    console.error("Subscription lookup failed:", err);
    return NextResponse.json(
      { error: "Subscription lookup failed" },
      { status: 500 }
    );
  }
}
