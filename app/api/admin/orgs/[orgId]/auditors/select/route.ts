export const dynamic = "force-dynamic";
import prisma from "../../../../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../../../../_lib/authGuard";
import { consoleViewer, canReachOrg } from "../../../../_scope";

// An org admin choosing a publicly-recognized auditor to work with their org.
// Records who chose whom and when, since one auditor may now serve several
// orgs at once (org_auditor_selection, not a scalar pesuser.org_id).
export async function POST(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

  const orgId = params.orgId;
  if (!canReachOrg(auth.viewer, orgId)) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const { auditorId } = await req.json();
  if (!auditorId) {
    return NextResponse.json({ error: "auditorId is required" }, { status: 400 });
  }

  const auditor = await prisma.pesuser.findFirst({
    where: { id: auditorId, role: "auditor" },
    select: { id: true, email: true },
  });
  if (!auditor) {
    return NextResponse.json({ error: "Auditor not found" }, { status: 404 });
  }

  const recognized = await prisma.auditor_responses.findFirst({
    where: { email: auditor.email, status: "approved", recognition_consent: true },
    select: { id: true },
  });
  if (!recognized) {
    return NextResponse.json(
      { error: "This auditor is not publicly recognized." },
      { status: 403 },
    );
  }

  const selectedBy = auth.viewer.user.userID;
  if (!selectedBy) {
    return NextResponse.json({ error: "Sign in again to continue." }, { status: 400 });
  }

  await prisma.org_auditor_selection.upsert({
    where: { org_id_auditor_id: { org_id: orgId, auditor_id: auditorId } },
    update: {},
    create: { org_id: orgId, auditor_id: auditorId, selected_by: selectedBy },
  });

  return NextResponse.json({ success: true });
}
