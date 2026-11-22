'use client';

// Holding a freshly invited auditor at the onboarding questionnaire until
// they've actually answered it.
//
// An invited auditor holds the real 'auditor' role from the moment their
// account is created — the org admin inviting them by name is itself the
// authorization, there's no lesser pending role. But they still haven't
// actually filled in who they are or answered the questionnaire yet, so this
// blocks every other screen until they have, the same way PasswordGate blocks
// a forced password change: one place they're allowed to be, until the thing
// that unblocks everything else happens. Since role alone can't tell "just
// invited" apart from "long since onboarded", this always asks the server.

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '@/app/utils/apiFetch';
import { getAccessToken, decodeToken } from '@/app/utils/auth';

const ALLOWED_PATH = '/auditor/questionnaire';

export default function AuditorOnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // Fail CLOSED: an auditor is presumed not-yet-onboarded until a successful
  // response says otherwise. This is still only a UX convenience — the real
  // enforcement is server-side (every route an onboarded auditor actually
  // acts through now checks org_auditor itself, see
  // app/lib/auditorOnboarding.ts) — but there's no reason for the fallback
  // here to be the permissive direction too.
  const [blocked, setBlocked] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const claims = decodeToken<{ role?: string }>(getAccessToken());
    if (claims?.role !== 'auditor') {
      // The fail-closed default above is specifically for an auditor whose
      // onboarding status couldn't be confirmed — it must not also apply to
      // every OTHER role just because `blocked` starts true. Forgetting this
      // line blocked every signed-in account in the app, not just auditors.
      setBlocked(false);
      setChecked(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/auditor-responses');
        if (!res.ok) throw new Error('status check failed');
        const data = await res.json();
        if (cancelled) return;
        const submitted = !!data?.submission;
        setBlocked(!submitted);
        if (!submitted && !pathname.startsWith(ALLOWED_PATH)) {
          router.replace(ALLOWED_PATH);
        }
      } catch {
        if (!cancelled) {
          // Unknown is treated as not-onboarded — a failed check must not
          // silently open the gate.
          setBlocked(true);
          if (!pathname.startsWith(ALLOWED_PATH)) router.replace(ALLOWED_PATH);
        }
      } finally {
        if (!cancelled) setChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!checked) return null;

  if (blocked && !pathname.startsWith(ALLOWED_PATH)) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-screen bg-canvas">
        <div className="max-w-md w-full bg-surface border border-line rounded-2xl shadow-card p-10 text-center">
          <h1 className="text-lg font-semibold text-strong mb-2">Finish your onboarding questionnaire</h1>
          <p className="text-sm text-muted">
            Answer the questionnaire and upload your documents before you can use the rest of the app.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
