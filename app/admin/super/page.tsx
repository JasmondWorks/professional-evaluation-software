'use client';

// Moved to /platform-operators in the main app shell. Kept as a redirect so
// the legacy console's own tab and any bookmark still land.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacySuperRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/platform-operators');
  }, [router]);

  return (
    <main className="p-6">
      <p className="text-sm text-muted">Taking you to Platform operators…</p>
    </main>
  );
}
