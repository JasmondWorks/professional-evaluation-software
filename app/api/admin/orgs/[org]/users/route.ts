export const dynamic = "force-dynamic";
import prisma from "../../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { authorize, tokenFromRequest } from "../../../../_lib/authGuard";

// The org whose users are listed comes from the URL, so this can read across
// tenants by construction — it belongs to the platform console, and a tenant
// admin must not reach it. Their own roster is /api/getUsers, which scopes to
// the org on their verified token.
export async function GET(
  req: NextRequest,
  { params }: { params: { org: string } }
) {
  const auth = authorize(tokenFromRequest(req), { roles: ["super-admin"], allowAdmins: false });
  if (!auth.ok) return auth.response;

  try {
    const users = await prisma.pesuser.findMany({
      where: { org: params.org },
      orderBy: { name: "asc" },
      select: {
      id: true,
      name: true,
      email: true,
      role: true,
      org: true,
      dept: true,
      gsm: true,
      address: true,
      image: true,
      audit_count: true,
    },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error listing users for org:", error);
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }
}
