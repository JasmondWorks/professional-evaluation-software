// Who may see an external auditor's uploaded credential documents.
//
// This lives on its own because two routes answer with these documents —
// /api/admin/all-auditors (the operator's roster) and /api/admin/auditors (the
// approve/reject queue) — and the first revision gated only one of them. The
// ungated sibling made the gate on the other pointless: the same documents were
// reachable without consent by asking the other endpoint. Both now call this,
// so the rule cannot be enforced in one place and forgotten in the other.
//
// The rule:
//
//   - The platform operator sees documents only where the auditor granted
//     recognition. The consent question is literally "do you want your role to
//     be recognized globally by this app", so it is the auditor's own answer
//     about cross-organization visibility, and the operator is not entitled to
//     credentials from someone who declined it. This includes rows predating
//     the consent column: the migration backfilled the flag from their stored
//     answers, so `false` there means they answered no, not that we don't know.
//
//   - An organization admin sees the submissions made to their own
//     organization, regardless of consent. The auditor uploaded those documents
//     while accepting that organization's invitation, so that organization is
//     the party they were handed to, and vetting them is the reason they were
//     requested. "Their own" means the submission's org_id, not the auditor
//     account's — see maySeeCredentials for why those two can diverge. Routes
//     must still scope their own queries; this helper decides what a visible
//     row may carry, not which rows are visible.

import { CREDENTIAL_SLOTS, sanitizeCredentials } from './questions';

export type AuditorDocument = {
  key: string;
  label: string;
  url: string;
};

/** Whether this viewer may see the documents on this submission.
 *
 *  The org-admin branch checks that the submission is actually theirs. It is
 *  not enough that the auditor's `pesuser` sits in their org: `auditor_responses`
 *  is upserted by email, and `org_id` travels with that upsert, so when a second
 *  organization invites the same auditor the single row — and the credentials on
 *  it — moves to the newer organization while the older `pesuser` keeps pointing
 *  at the first. Matching on the user's org alone therefore showed organization
 *  A the documents uploaded for organization B's engagement.
 *
 *  A null `org_id` (rows predating that column) belongs to no tenant and is the
 *  platform operator's to judge, so it fails the org-admin check. */
export function maySeeCredentials(
  viewer: { isPlatform: boolean; orgId?: string | null },
  row: { recognition_consent?: boolean | null; org_id?: string | null },
): boolean {
  if (viewer.isPlatform) return Boolean(row.recognition_consent);
  return Boolean(viewer.orgId) && row.org_id === viewer.orgId;
}

/** The documents to return for one submission.
 *
 *  Null means the viewer may not see them, which is deliberately distinct from
 *  an empty array — an auditor who uploaded nothing. The screens word those two
 *  cases differently, and collapsing them would report "none uploaded" for
 *  someone who simply withheld consent.
 *
 *  sanitizeCredentials re-checks the stored payload rather than trusting it:
 *  these rows were written by a public form and the values are rendered as
 *  links, so this is the boundary that keeps a non-http(s) string from becoming
 *  an href. */
export function auditorDocumentsFor(
  viewer: { isPlatform: boolean; orgId?: string | null },
  row: { recognition_consent?: boolean | null; credentials?: unknown; org_id?: string | null },
): AuditorDocument[] | null {
  if (!maySeeCredentials(viewer, row)) return null;

  const stored = sanitizeCredentials(row.credentials);
  return CREDENTIAL_SLOTS.filter((slot) => stored[slot.key]).map((slot) => ({
    key: slot.key,
    label: slot.label,
    url: stored[slot.key] as string,
  }));
}
