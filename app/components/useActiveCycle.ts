"use client";

// Live view of the org's active stress cycle for the current user. Fetches on
// mount, then keeps itself fresh WITHOUT a page refresh by:
//   • polling on an interval (default 30s), and
//   • refetching whenever the tab regains focus / becomes visible.
// So when an admin opens (or closes) a cycle, a staff member already sitting on
// their dashboard or a stress form sees it appear/disappear on their own.

import { useCallback, useEffect, useRef, useState } from "react";

export type FormStatus = "not_yet" | "open" | "closed";
export type FormState = {
  open: boolean;
  status: FormStatus;
  submitted: boolean;
  opensAt?: string | null;
  closesAt?: string | null;
  returnedReason?: string | null;
};
export type ActiveCycle = {
  active: boolean;
  phase?: string;
  form5?: FormState;
  form6?: FormState;
  cta?: { message: string; href: string } | null;
  notice?: { message: string } | null;
};

export function useActiveCycle(pollMs = 30000) {
  const [data, setData] = useState<ActiveCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token || token === "undefined" || token === "null") {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/stress/active-cycle", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (mounted.current) setData(d);
    } catch {
      /* keep the last known value */
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
      if (document.visibilityState === "visible") refetch();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mounted.current = false;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refetch, pollMs]);

  return { data, loading, refetch };
}
