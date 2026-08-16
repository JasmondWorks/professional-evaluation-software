'use client';

// One source of truth for the signed-in user's record.
//
// The JWT is issued at login and never changes afterwards, so anything stored in
// it goes stale the moment a profile is edited. The avatar is exactly that case:
// upload a photo and the topbar, sidebar, profile and dashboard all have to
// change at once, without a reload.
//
// So the record is fetched once, cached in this module, and shared. Any surface
// calls useCurrentUser(); after an upload, refreshCurrentUser() re-fetches and
// every subscriber re-renders.

import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/utils/apiFetch';
import { getAccessToken } from '@/app/utils/auth';

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  display_role?: string | null;
  image: string | null;
  org: string | null;
  dept: string | null;
  gsm?: string | null;
  address?: string | null;
  faculty_college?: string | null;
  dob?: string | null;
  doa?: string | null;
  poa?: string | null;
  doc?: string | null;
  post?: string | null;
  dopp?: string | null;
  level?: string | null;
};

type State = {
  user: CurrentUser | null;
  loading: boolean;
  error: boolean;
};

let cache: State = { user: null, loading: true, error: false };
let inFlight: Promise<void> | null = null;
// Which token the cached record belongs to. Without this the cache outlives a
// logout, so the next person to sign in on the same tab sees the previous user,
// or nothing at all.
let cachedFor: string | null = null;
const subscribers = new Set<(s: State) => void>();

function publish(next: State) {
  cache = next;
  subscribers.forEach((fn) => fn(cache));
}

async function load(): Promise<void> {
  cachedFor = typeof window === 'undefined' ? null : getAccessToken();
  try {
    const res = await apiFetch('/api/getUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error('failed');
    const user = (await res.json()) as CurrentUser;
    publish({ user, loading: false, error: false });
  } catch {
    publish({ user: null, loading: false, error: true });
  } finally {
    inFlight = null;
  }
}

/** Forget the cached record. Call on logout, so the next sign-in on this tab
 *  starts clean rather than inheriting the previous person's details. */
export function clearCurrentUser() {
  cachedFor = null;
  inFlight = null;
  publish({ user: null, loading: true, error: false });
}

/** Re-read the record and update every surface showing it. Call after any change
 *  to the user's own profile, such as a new photo. */
export function refreshCurrentUser(): Promise<void> {
  inFlight = load();
  return inFlight;
}

/** Update the cached record locally without a round trip. Used to show a new
 *  avatar the instant the upload returns. */
export function patchCurrentUser(patch: Partial<CurrentUser>) {
  if (!cache.user) return;
  publish({ ...cache, user: { ...cache.user, ...patch } });
}

export function useCurrentUser(): State {
  const [state, setState] = useState<State>(cache);

  useEffect(() => {
    subscribers.add(setState);

    const token = typeof window === 'undefined' ? null : getAccessToken();
    // Refetch when there is no record yet, when the last attempt failed, or when
    // the signed-in user has changed. The previous guard also skipped on `error`,
    // which meant a single failed request (one fired before the token had landed,
    // say) latched for the rest of the session and the details never appeared.
    const stale = !cache.user || cache.error || cachedFor !== token;
    if (stale && !inFlight) inFlight = load();
    else setState(cache);

    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return state;
}
