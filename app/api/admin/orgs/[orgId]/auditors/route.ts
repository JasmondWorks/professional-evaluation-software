export const dynamic = "force-dynamic";
import prisma from "../../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../../../_lib/authGuard";
import { consoleViewer, canReachOrg } from "../../../_scope";

// Org named in the URL — same reasoning as ./users.
export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

  const orgId = Number(params.orgId);
  if (!Number.isFinite(orgId)) {
    return NextResponse.json({ error: "Invalid org id" }, { status: 400 });
  }
  if (!canReachOrg(auth.viewer, orgId)) {
    return NextResponse.json(
      { error: "You do not have permission to view this organization" },
      { status: 403 }
    );
  }

  const auditors = await prisma.pesuser.findMany({
    where: { org_id: orgId, role: "auditor" },
    select: { id: true, name: true, email: true, role: true, org_id: true },
  });

  return NextResponse.json(auditors);
}
