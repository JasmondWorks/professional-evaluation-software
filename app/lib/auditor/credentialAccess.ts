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
//   - An organization admin sees their own org's auditors regardless of
//     consent. The auditor uploaded those documents while accepting that
//     organization's invitation, so that organization is the party they were
//     handed to, and vetting them is the reason they were requested. Routes
//     must still scope their query to the caller's org — this helper decides
//     what a visible row may carry, not which rows are visible.

import { CREDENTIAL_SLOTS, sanitizeCredentials } from './questions';

export type AuditorDocument = {
  key: string;
  label: string;
  url: string;
};

/** Whether this viewer may see the documents on this submission. */
export function maySeeCredentials(
  viewer: { isPlatform: boolean },
  row: { recognition_consent?: boolean | null },
): boolean {
  return viewer.isPlatform ? Boolean(row.recognition_consent) : true;
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
  viewer: { isPlatform: boolean },
  row: { recognition_consent?: boolean | null; credentials?: unknown },
): AuditorDocument[] | null {
  if (!maySeeCredentials(viewer, row)) return null;

  const stored = sanitizeCredentials(row.credentials);
  return CREDENTIAL_SLOTS.filter((slot) => stored[slot.key]).map((slot) => ({
    key: slot.key,
    label: slot.label,
    url: stored[slot.key] as string,
  }));
}
