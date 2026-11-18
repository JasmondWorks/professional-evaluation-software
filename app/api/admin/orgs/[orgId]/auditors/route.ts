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

  const orgId = params.orgId;
  if (!orgId) {
    return NextResponse.json({ error: "Invalid org id" }, { status: 400 });
  }
  if (!canReachOrg(auth.viewer, orgId)) {
    // Same body as an org that doesn't exist: whether this id belongs to
    // another tenant is not something this caller should be able to learn.
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  // Org-auditor relationships live in org_auditor_selection now, not a scalar
  // pesuser.org_id — an auditor can be selected by more than one org.
  const selections = await prisma.org_auditor_selection.findMany({
    where: { org_id: orgId },
    orderBy: { selected_at: "desc" },
  });
  if (selections.length === 0) return NextResponse.json([]);

  const auditors = await prisma.pesuser.findMany({
    where: { id: { in: selections.map((s) => s.auditor_id) }, role: "auditor" },
    select: { id: true, name: true, email: true, role: true },
  });
  const byId = new Map(auditors.map((a) => [a.id, a]));

  const result = selections
    .map((s) => {
      const a = byId.get(s.auditor_id);
      return a ? { ...a, selectedAt: s.selected_at } : null;
    })
    .filter(Boolean);

  return NextResponse.json(result);
}

export async function DELETE(
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

  await prisma.org_auditor_selection.deleteMany({
    where: { org_id: orgId, auditor_id: auditorId },
  });

  return NextResponse.json({ success: true });
}
