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
    select: { ...PUBLIC_USER_COLUMNS, globally_recognized: true },
  });

  // PUBLIC_USER_COLUMNS carries org_id, not a displayable org name — the page
  // needs the name to group/label by, so resolve it here rather than leaving
  // the client to show the raw id (or "undefined", when it tried to read a
  // `org` field that was never selected at all).
  const orgIds = Array.from(new Set(auditors.map((a) => a.org_id).filter((id): id is string => !!id)));
  const orgs = await prisma.org.findMany({ where: { id: { in: orgIds } }, select: { id: true, name: true } });
  const orgNameById = new Map(orgs.map((o) => [o.id, o.name]));

  return NextResponse.json(
    auditors.map((a) => ({ ...a, org: a.org_id ? (orgNameById.get(a.org_id) ?? "Unknown organization") : "Unassigned" })),
  );
}
