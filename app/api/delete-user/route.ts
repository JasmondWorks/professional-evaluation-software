import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev"; // adjust path

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { org, email } = body;

    if (!org || !email) {
      return NextResponse.json(
        { success: false, message: "org and email are required" },
        { status: 400 }
      );
    }

    // Use parameterized query to prevent SQL injection
    const result: any = await prisma.$queryRawUnsafe(`
      DELETE FROM pesuser
      WHERE org = $1 AND email = $2
      RETURNING *;
    `, org, email);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, message: "No user found with that org/email" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.length} user(s) successfully`,
      deleted: result,
    });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
