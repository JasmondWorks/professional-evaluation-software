'use client';

// The legacy console's separate sign-in, now a redirect.
//
// It posted to /api/admin/login, which differs from the ordinary login only by
// refusing accounts that are not a platform tier — and it then pushed a
// super-admin to /dashboard in the main app anyway. The ordinary login already
// admits every tier and lands each one correctly, so this was a second door
// into the same building.
//
// Kept as a redirect rather than deleted: the URL has been handed out, and a
// 404 at a sign-in page is the worst place to discover a move.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyAdminLogin() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6">
      <p className="text-sm text-muted">Sign-in has moved. Taking you there…</p>
    </main>
  );
}
