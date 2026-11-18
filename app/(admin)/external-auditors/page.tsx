'use client';

// Recognised external auditors, across every organization — the platform
// operator's view, in the shell the platform operator actually works in.
//
// This finishes a migration that was left half-done. `app/admin/*` is a legacy
// console with its own layout and its own login, and the login already sends a
// super-admin to the main app ("The platform console for super-admin now lives
// in the main app's own dashboard, not this legacy shell"). But the auditor
// roster stayed behind in that shell at /admin/auditor, and nothing in the main
// app linked to it — so the operator was sent to an app with no route to the one
// screen that is theirs alone. /admin/auditor now redirects here.
//
// Not to be confused with /admin/auditors, the organization admin's vetting
// queue for their own invitees. Same subject, different job: that one is where
// an invitation is approved or rejected; this is the roster of everyone already
// approved, anywhere on the platform.

import { PageHeader } from '@/app/components/ui';
import PlatformAuditorRoster from '@/app/components/auditor/PlatformAuditorRoster';

export default function ExternalAuditorsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Recognised auditors"
        subtitle="Approved external auditors across every organization, with the credentials of those who consented to be recognised by PES."
      />
      <PlatformAuditorRoster />
    </div>
  );
}
