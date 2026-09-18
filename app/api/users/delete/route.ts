// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import prisma from "../../prisma.dev"; // adjust path
import { authorize, tokenFromRequest } from "../../_lib/authGuard";
import { PUBLIC_USER_COLUMNS } from "../../admin/_scope";

export async function POST(req: Request) {
  try {
    // Deleting users requires the manage_user capability (or admin tier), and
    // is scoped to the caller's own org — same rule as /api/delete-user.
    const auth = authorize(tokenFromRequest(req), { anyOf: ["can_manage_user_roles"] });
    if (!auth.ok) return auth.response;
    const orgId = auth.user.orgId;

    const body = await req.json();
    const { email, id } = body;

    if (!orgId) {
      return NextResponse.json(
        { success: false, message: "Your session has no organization — please log in again." },
        { status: 400 }
      );
    }
    if (!id && !email) {
      return NextResponse.json(
        { success: false, message: "A user id or email is required to delete." },
        { status: 400 }
      );
    }

    // Prefer the id (always available from the profile route); fall back to email.
    const where = id ? { org_id: orgId, id: String(id) } : { org_id: orgId, email };

    // Fetch matching users first so we can report exactly what was removed.
    const result = await prisma.pesuser.findMany({ where, select: PUBLIC_USER_COLUMNS });

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "No matching user found in your organization." },
        { status: 404 }
      );
    }

    await prisma.pesuser.deleteMany({ where });

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
