export const dynamic = "force-dynamic";
import prisma from "../../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../../../_lib/authGuard";
import { consoleViewer, canReachOrg } from "../../../_scope";

// Org named in the URL — same reasoning as ./users.
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

  const auditors = await prisma.pesuser.findMany({
    where: { org, role: "auditor" },
    select: { id: true, name: true, email: true, role: true, org: true },
  });

  return NextResponse.json(auditors);
}
