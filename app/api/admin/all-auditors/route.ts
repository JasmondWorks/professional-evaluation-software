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

  const auditors = await prisma.pesuser.findMany({
    where: auth.viewer.isPlatform
      ? { role: "auditor", email: { in: approvedEmails } }
      : { role: "auditor", org_id: auth.viewer.orgId, email: { in: approvedEmails } },
    select: PUBLIC_USER_COLUMNS,
  });

  // The organization's display name. PUBLIC_USER_COLUMNS carries org_id only,
  // and the roster groups its rows by organization — so without this every
  // auditor fell into a single group headed "undefined", and each row linked
  // to /admin/undefined/<id>.
  const orgIds = Array.from(
    new Set(auditors.map((a) => a.org_id).filter((id): id is string => Boolean(id))),
  );
  const orgs = orgIds.length
    ? await prisma.org.findMany({
        where: { id: { in: orgIds } },
        select: { id: true, name: true },
      })
    : [];
  const orgNameById = new Map(orgs.map((o) => [o.id, o.name]));

  const enriched = auditors.map((a) => {
    const record = a.email ? byEmail.get(a.email) : undefined;
    const consented = record?.recognition_consent ?? false;

    return {
      ...a,
      org: (a.org_id && orgNameById.get(a.org_id)) || 'Unassigned',
      recognitionConsent: consented,
      submittedAt: record?.created_at ?? null,
      /** Null when the viewer may not see them, which is different from an
       *  auditor who simply uploaded nothing (an empty array). */
      // record.org_id, not the pesuser's: the submission is upserted by email
      // and its org_id follows the most recent inviting organization, so the
      // two can name different tenants for the same person.
      documents: auditorDocumentsFor(auth.viewer, {
        recognition_consent: consented,
        credentials: record?.credentials,
        org_id: record?.org_id ?? null,
      }),
    };
  });

  return NextResponse.json(enriched);
}
