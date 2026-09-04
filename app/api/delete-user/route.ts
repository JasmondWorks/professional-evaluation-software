// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import prisma from "../prisma.dev"; // adjust path
import { authorize, tokenFromRequest } from "../_lib/authGuard";

export async function POST(req: Request) {
  try {
    // Deleting users requires the manage_user capability (or admin tier). Uses
    // the verified token's org so deletions are scoped to the caller's org.
    const auth = authorize(tokenFromRequest(req), { anyOf: ["can_manage_user_roles"] });
    if (!auth.ok) return auth.response;
    const org = auth.user.org;

    const body = await req.json();
    const { email } = body;

    if (!org || !email) {
      return NextResponse.json(
        { success: false, message: "email is required" },
        { status: 400 }
      );
    }

    // Fetch matching users first so we can report exactly what was removed.
    const result = await prisma.pesuser.findMany({ where: { org, email } });

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "No user found with that org/email" },
        { status: 404 }
      );
    }

    await prisma.pesuser.deleteMany({ where: { org, email } });

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
