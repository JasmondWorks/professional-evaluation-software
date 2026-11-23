'use client';

// Merged into /admin/auditors (the same page now branches by role — org admin
// vs platform admin). Kept as a redirect so an old link or bookmark to this
// singular path still lands somewhere real.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuditorSingularRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/auditors');
  }, [router]);

  return (
    <main className="p-6">
      <p className="text-sm text-muted">Taking you to External Auditors…</p>
    </main>
  );
}
