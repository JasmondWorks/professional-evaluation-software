export const dynamic = "force-dynamic";
import prisma from "../../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../../../_lib/authGuard";
import { consoleViewer, canReachOrg, PUBLIC_USER_COLUMNS } from "../../../_scope";

// The org comes from the URL, so without a check this reads across tenants by
// construction — which is what it did, unauthenticated. An org admin may now ask
// only about their own org; the platform operator may ask about any.
export async function GET(
  req: NextRequest,
  { params }: { params: { org: string } }
) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

  const org = decodeURIComponent(params.org);
  if (!canReachOrg(auth.viewer, org)) {
    return NextResponse.json(
      { error: "You do not have permission to view this organization" },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.pesuser.findMany({
      where: { org },
      orderBy: { name: "asc" },
      select: PUBLIC_USER_COLUMNS,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error listing users for org:", error);
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }
}
