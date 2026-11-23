export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../prisma.dev";
import { tokenFromRequest } from "../../_lib/authGuard";
import { consoleViewer, canReachOrg } from "../_scope";

// The org's own auditors — submitting the onboarding questionnaire (see
// /api/auditor-responses) already activates someone locally; there is no
// approval step here to act on. This is a visibility list, not a queue.
export async function GET(req: Request) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

  try {
    const auditors = await prisma.auditor_responses.findMany({
      where: auth.viewer.isPlatform ? {} : { org_id: auth.viewer.orgId },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(auditors);
  } catch (error: any) {
    console.error("Error fetching auditors:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Remove an auditor from this org — the only action left for an org admin to
// take here. It ends the local org_auditor association; it does not touch
// the account itself (role, other org associations, or any global
// recognition status), and a removed local auditor can be re-added later the
// same way any publicly recognized auditor would be (see /api/org/auditors).
export async function POST(req: Request) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

  try {
    const { id, action } = await req.json();

    if (!id || action !== "remove") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const a = await prisma.auditor_responses.findUnique({ where: { id } });
    if (!a) {
      return NextResponse.json({ error: "Auditor not found" }, { status: 404 });
    }
    if (a.org_id && !canReachOrg(auth.viewer, a.org_id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!a.org_id) {
      return NextResponse.json({ error: "This application has no associated organization" }, { status: 400 });
    }

    const auditor = await prisma.pesuser.findFirst({
      where: { email: a.email, role: "auditor" },
      select: { id: true },
    });
    if (auditor) {
      await prisma.org_auditor.updateMany({
        where: { org_id: a.org_id, auditor_id: auditor.id, status: "active" },
        data: { status: "ended", ended_at: new Date() },
      });
    }

    await prisma.auditor_responses.update({ where: { id }, data: { status: "removed" } });

    return NextResponse.json({ success: true, message: "Auditor removed from your organization" });
  } catch (error: any) {
    console.error("Error removing auditor:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
