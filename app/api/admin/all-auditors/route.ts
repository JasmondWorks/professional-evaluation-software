import prisma from "../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../_lib/authGuard";
import { consoleViewer, PUBLIC_USER_COLUMNS } from "../_scope";

// This route queries the DB per request — never prerender/cache it at build time.
export const dynamic = "force-dynamic";

// Auditors: every organization's for the platform operator, the caller's own for
// an org admin. Was unauthenticated and returned full pesuser rows.
//
// `role: "auditor"` alone is not proof of acceptance — a role can be reassigned
// by hand outside the application flow — so this cross-checks against
// auditor_responses, which is the actual accept/reject record.
export async function GET(req: NextRequest) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

  const approved = await prisma.auditor_responses.findMany({
    where: { status: "approved" },
    select: { email: true },
  });
  const approvedEmails = approved.map((a) => a.email);

  const auditors = await prisma.pesuser.findMany({
    where: auth.viewer.isPlatform
      ? { role: "auditor", email: { in: approvedEmails } }
      : { role: "auditor", org_id: auth.viewer.orgId, email: { in: approvedEmails } },
    select: PUBLIC_USER_COLUMNS,
  });

  return NextResponse.json(auditors);
}
