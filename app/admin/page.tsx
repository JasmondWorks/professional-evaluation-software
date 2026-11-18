'use client';

// The legacy console's entry point.
//
// `app/admin/*` was a second shell with its own layout and its own login, and
// its login already sent a platform operator to the main app — "the platform
// console for super-admin now lives in the main app's own dashboard, not this
// legacy shell". What is left here is the super-admin list and an organization
// drill-down; everything else was either superseded by the main app or had
// never worked.
//
// This path keeps existing so an old bookmark lands somewhere real instead of
// a 404, and sends people to the one sign-in the application has.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyAdminEntry() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6">
      <p className="text-sm text-muted">Taking you to sign in…</p>
    </main>
  );
}
