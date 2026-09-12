'use client';

// Choosing a password from a set-password or reset link.
//
// One page for both. The provisioning email sends people here to choose their
// first password — no password is ever emailed — and a reset link lands here
// too, with the wording adjusted.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { notify } from '@/lib/toast';

type Check =
  | { state: 'checking' }
  | { state: 'valid'; purpose: 'setup' | 'reset'; name: string | null; email: string; organization: string | null }
  | { state: 'invalid'; error: string };

export default function SetPasswordPage() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';

  const [check, setCheck] = useState<Check>({ state: 'checking' });
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Asking for a new link, for when this one has expired.
  const [resendEmail, setResendEmail] = useState('');
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) {
      setCheck({ state: 'invalid', error: 'This link is missing its token.' });
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/password/set?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok && data.ok) {
          setCheck({
            state: 'valid',
            purpose: data.purpose,
            name: data.name,
            email: data.email,
            organization: data.organization,
          });
        } else {
          setCheck({ state: 'invalid', error: data.error ?? 'This link cannot be used.' });
        }
      } catch {
        setCheck({ state: 'invalid', error: 'We could not check this link. Try again in a moment.' });
      }
    })();
  }, [token]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (password !== confirm) {
        notify.error('Those passwords do not match.');
        return;
      }
      setSaving(true);
      try {
        const res = await fetch('/api/password/set', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          notify.error(data.error ?? 'Could not set your password.');
          return;
        }
        setDone(true);
        // Straight to sign-in: they have a password now and nothing else to do
        // here, and a page that just says "success" is a dead end.
        setTimeout(() => router.replace('/login'), 1600);
      } finally {
        setSaving(false);
      }
    },
    [token, password, confirm, router],
  );

  const requestNew = useCallback(async () => {
    await fetch('/api/password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resendEmail }),
    });
    // Deliberately unconditional: whether the address exists is not something
    // this page should reveal.
    setResent(true);
  }, [resendEmail]);

  if (check.state === 'checking') {
    return (
      <div className="w-full max-w-md mx-auto text-center py-20">
        <div className="mx-auto w-9 h-9 border-4 border-pes border-t-transparent rounded-full animate-spin" />
        <p className="mt-5 text-sm text-muted">Checking your link…</p>
      </div>
    );
  }

  if (check.state === 'invalid') {
    return (
      <div className="w-full max-w-md mx-auto py-10">
        <h1 className="text-2xl font-bold text-strong mb-2">This link cannot be used</h1>
        <p className="text-sm text-muted mb-8">{check.error}</p>

        {resent ? (
          <div className="rounded-lg bg-canvas border border-line p-4">
            <p className="text-sm text-body">
              If that email has an account, a new link is on its way. It expires in
              seven days.
            </p>
          </div>
        ) : (
          <div>
            <label htmlFor="resend" className="block text-sm font-medium text-strong mb-1.5">
              Send me a new link
            </label>
            <div className="flex gap-2">
              <input
                id="resend"
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@organization.com"
                className="flex-1 h-11 px-3 rounded-lg border border-line text-sm outline-none focus:border-pes"
              />
              <button
                type="button"
                onClick={requestNew}
                disabled={!resendEmail.includes('@')}
                className="h-11 px-5 rounded-lg bg-pes text-white text-sm font-medium disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        )}

        <p className="mt-8 text-sm text-muted">
          <Link href="/login" className="text-pes font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-md mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold text-strong mb-2">Password set</h1>
        <p className="text-sm text-muted">Taking you to sign in…</p>
      </div>
    );
  }

  const setup = check.purpose === 'setup';

  return (
    <div className="w-full max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold text-strong mb-2">
        {setup ? 'Choose your password' : 'Set a new password'}
      </h1>
      <p className="text-sm text-muted mb-8">
        {setup && check.organization ? (
          <>
            You are the administrator of <strong>{check.organization}</strong>. Choose
            a password to finish setting up your account.
          </>
        ) : (
          'Choose a password for your account.'
        )}
      </p>

      <div className="rounded-lg bg-canvas border border-line px-4 py-3 mb-6">
        <p className="text-xs text-muted">Signing in as</p>
        <p className="text-sm font-medium text-strong">{check.email}</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-strong mb-1.5">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-line text-sm outline-none focus:border-pes"
          />
          <p className="mt-1.5 text-xs text-muted">At least 8 characters.</p>
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-strong mb-1.5">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-line text-sm outline-none focus:border-pes"
          />
        </div>

        <button
          type="submit"
          disabled={saving || password.length < 8 || !confirm}
          className="h-11 rounded-lg bg-pes text-white text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving…' : setup ? 'Set password and continue' : 'Save new password'}
        </button>
      </form>
    </div>
  );
}
