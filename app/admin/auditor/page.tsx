'use client';

// The roster moved into the main app shell, where the platform operator works.
// This path stays as a redirect so the legacy console's own "Auditors" tab, and
// any bookmark, still land somewhere correct rather than 404.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyAuditorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/external-auditors');
  }, [router]);

  return (
    <main className="p-6">
      <p className="text-sm text-muted">Taking you to Recognised auditors…</p>
    </main>
  );
}
