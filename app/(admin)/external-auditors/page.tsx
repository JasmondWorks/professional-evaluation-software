'use client';

// The platform-wide auditor roster + recognition queue moved to /admin/auditor
// (now in the main app shell, as two tabs on one page). This stays as a
// redirect so an old bookmark lands somewhere real rather than a 404.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExternalAuditorsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/auditor');
  }, [router]);

  return (
    <main className="p-6">
      <p className="text-sm text-muted">Taking you to Auditors…</p>
    </main>
  );
}
