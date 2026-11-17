import prisma from "../../prisma.dev";
import { NextRequest, NextResponse } from "next/server";
import { tokenFromRequest } from "../../_lib/authGuard";
import { consoleViewer, PUBLIC_USER_COLUMNS } from "../_scope";
import { auditorDocumentsFor } from "@/app/lib/auditor/credentialAccess";

// This route queries the DB per request — never prerender/cache it at build time.
export const dynamic = "force-dynamic";

// Auditors: every organization's for the platform operator, the caller's own for
// an org admin. Was unauthenticated and returned full pesuser rows.
//
// `role: "auditor"` alone is not proof of acceptance — a role can be reassigned
// by hand outside the application flow — so this cross-checks against
// auditor_responses, which is the actual accept/reject record.
//
// It also returns the auditor's uploaded credential documents and whether they
// consented to being recognized by PES. Both were being collected at submission
// and then never read by anything: no route selected them and no screen rendered
// them, so the client's request for the operator to reach "the emails and
// uploaded documents of the external auditors recognised by PES" had no surface
// behind it at all.
//
// Who may see the documents:
//
//   - The platform operator sees them only where the auditor consented to
//     global recognition. That consent question is precisely "do you want your
//     role to be recognized globally by this app", so it is the auditor's own
//     answer about cross-organization visibility — the operator is not entitled
//     to credentials from someone who declined it.
//   - An organization admin sees their own org's auditors regardless of consent.
//     The auditor uploaded those documents while accepting that organization's
//     invitation, so that organization is the party they were handed to, and
//     vetting them is the reason they were asked for.
export async function GET(req: NextRequest) {
  const auth = consoleViewer(tokenFromRequest(req));
  if (!auth.ok) return auth.response;

  const responses = await prisma.auditor_responses.findMany({
    where: { status: "approved" },
    select: {
      email: true,
      credentials: true,
      recognition_consent: true,
      org_id: true,
      created_at: true,
    },
  });

  const approvedEmails = responses.map((a) => a.email);
  const byEmail = new Map(responses.map((r) => [r.email, r]));

  // Org<->auditor relationships are recorded in org_auditor_selection, not
  // pesuser.org_id — one auditor may now be selected by several orgs, each at
  // its own timestamp, which is what the platform operator asked to see.
  const auditors = await prisma.pesuser.findMany({
    where: { role: "auditor", email: { in: approvedEmails } },
    select: PUBLIC_USER_COLUMNS,
  });
  const auditorIds = auditors.map((a) => a.id);

  const selections = auditorIds.length
    ? await prisma.org_auditor_selection.findMany({
        where: {
          auditor_id: { in: auditorIds },
          ...(auth.viewer.isPlatform ? {} : { org_id: auth.viewer.orgId as string }),
        },
        orderBy: { selected_at: "desc" },
      })
    : [];
  const orgIds = Array.from(new Set(selections.map((s) => s.org_id)));
  const orgs = orgIds.length
    ? await prisma.org.findMany({ where: { id: { in: orgIds } }, select: { id: true, name: true } })
    : [];
  const orgNameById = new Map(orgs.map((o) => [o.id, o.name]));
  const byAuditorId = new Map<string, typeof selections>();
  for (const s of selections) {
    byAuditorId.set(s.auditor_id, [...(byAuditorId.get(s.auditor_id) ?? []), s]);
  }

  // An org admin only cares about auditors their own org has actually
  // selected; the platform operator sees every approved auditor, including
  // those no org has picked yet (selections: []).
  const visibleAuditors = auth.viewer.isPlatform
    ? auditors
    : auditors.filter((a) => (byAuditorId.get(a.id) ?? []).length > 0);

  // One row per auditor — this is a roster of recognized people, not of
  // org<->auditor pairs. Which orgs picked them is an attribute of the
  // person, attached as `selections`, not the thing the list is grouped by.
  const enriched = visibleAuditors.map((a) => {
    const record = a.email ? byEmail.get(a.email) : undefined;
    const consented = record?.recognition_consent ?? false;
    const documents = auditorDocumentsFor(auth.viewer, {
      recognition_consent: consented,
      credentials: record?.credentials,
      org_id: record?.org_id ?? null,
    });
    const auditorSelections = byAuditorId.get(a.id) ?? [];

    return {
      ...a,
      recognitionConsent: consented,
      submittedAt: record?.created_at ?? null,
      documents,
      selections: auditorSelections.map((s) => ({
        org: orgNameById.get(s.org_id) || "Unknown organization",
        selectedAt: s.selected_at,
      })),
    };
  });

  return NextResponse.json(enriched);
}
