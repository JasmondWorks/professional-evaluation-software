import { NextRequest, NextResponse } from "next/server";
import prisma from "../../prisma.dev";
import { jwtDecode } from "jwt-decode";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  
  if (!token) {
    return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
  }

  let email;
  try {
    const decoded: any = jwtDecode(token);
    email = decoded?.email;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json(
      { error: "Email is required in token" },
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
      AND (expires_at > NOW() OR expires_at IS NULL)
      ORDER BY created_at DESC
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
