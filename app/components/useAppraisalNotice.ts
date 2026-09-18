'use client';

// Live view of the org's appraisal period for the current user. Mirrors
// useActiveCycle for the stress model: fetches on mount, then keeps itself fresh
// WITHOUT a page refresh by
//   • polling on an interval (default 30s), and
//   • refetching whenever the tab regains focus or becomes visible.
//
// So when the organization admin opens a period, or a head of department returns
// a score, whoever is sitting on their dashboard sees it appear on their own.

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';

export type AppraisalNotice = {
  active: boolean;
  cta?: { title: string; message: string; href: string; action: string } | null;
  notice?: { message: string } | null;
};

export function useAppraisalNotice(pollMs = 30000) {
  const [data, setData] = useState<AppraisalNotice | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    const token = typeof window !== 'undefined' ? getAccessToken() : null;
    if (!token || token === 'undefined' || token === 'null') {
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch('/api/appraisal-v2/active-period');
      if (!res.ok) return;
      const d = await res.json();
      if (mounted.current) setData(d);
    } catch {
      // A failed poll is not worth surfacing; the next one will retry.
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refetch();

    const id = setInterval(refetch, pollMs);
    const onFocus = () => refetch();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refetch();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      mounted.current = false;
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refetch, pollMs]);

  return { data, loading, refetch };
}
