export const dynamic = "force-dynamic";
import prisma from "../../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../../../_lib/authGuard";
import { consoleViewer, canReachOrg } from "../../../_scope";

// The publicly-recognized pool an org admin may choose from: platform-approved
// auditors who opted into cross-org recognition, minus the ones this org has
// already selected.
export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

  const orgId = params.orgId;
  if (!canReachOrg(auth.viewer, orgId)) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const recognized = await prisma.auditor_responses.findMany({
    where: { status: "approved", recognition_consent: true },
    select: { email: true },
  });
  if (recognized.length === 0) return NextResponse.json([]);

  const alreadySelected = await prisma.org_auditor_selection.findMany({
    where: { org_id: orgId },
    select: { auditor_id: true },
  });
  const selectedIds = new Set(alreadySelected.map((s) => s.auditor_id));

  const auditors = await prisma.pesuser.findMany({
    where: {
      role: "auditor",
      email: { in: recognized.map((r) => r.email) },
    },
    select: { id: true, name: true, email: true, gsm: true, image: true },
  });

  return NextResponse.json(auditors.filter((a) => !selectedIds.has(a.id)));
}
