'use client';

// Holding someone at the change-password screen when their password was not
// chosen by them.
//
// Every employee an administrator adds is emailed a generated password in plain
// text — the administrator has seen it too, and so has anyone with access to
// that mailbox. Until they replace it, that password is not a secret, so the
// product should not let them get on with anything else.
//
// Accounts provisioned from a payment are not affected: they choose their
// password through the emailed link before they ever sign in.

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAccessToken, decodeToken } from '@/app/utils/auth';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const claims = decodeToken<{ mustChangePassword?: boolean }>(getAccessToken());
    const must = claims?.mustChangePassword === true;
    setBlocked(must);

    // The change-password screen is the one place they are allowed to be.
    if (must && !pathname.startsWith('/change-password')) {
      router.replace('/change-password?first=1');
    }
  }, [pathname, router]);

  if (blocked && !pathname.startsWith('/change-password')) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-screen bg-canvas">
        <div className="max-w-md w-full bg-surface border border-line rounded-2xl shadow-card p-10 text-center">
          <h1 className="text-lg font-semibold text-strong mb-2">Choose your own password</h1>
          <p className="text-sm text-muted">
            The password you signed in with was generated for you and sent by
            email. Replace it before you continue.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
