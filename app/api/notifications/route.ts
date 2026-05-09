// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org } = body;

    if (!org) {
      return NextResponse.json(
        { error: "Missing org" },
        { status: 400 }
      );
    }

    const query = `
      SELECT id, user_id, org, title, message, is_read, created_at
      FROM notifications
      WHERE org = $1
      ORDER BY created_at DESC;
    `;
    const notifications = await prisma.$queryRawUnsafe(query, org);

    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
