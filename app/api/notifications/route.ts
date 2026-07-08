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

    const notifications = await prisma.notifications.findMany({
      where: { org },
      select: {
        id: true,
        user_id: true,
        org: true,
        title: true,
        message: true,
        is_read: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
