'use client';

// State that survives navigating away and back within the tab.
//
// The org structure ladder is worked out level by level, each level executed by
// hand — and it was all thrown away the moment the operator opened the run
// history and came back. The client reported exactly that: "the table result is
// usually lost when we return from the view history page".
//
// sessionStorage rather than localStorage: the work belongs to the sitting, not
// to the machine. Closing the tab is a deliberate end to it; clicking a link is
// not.

import { useEffect, useState } from 'react';

export function useStickyState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const stored = window.sessionStorage.getItem(key);
      return stored == null ? initial : (JSON.parse(stored) as T);
    } catch {
      // A malformed or unreadable entry should cost the operator a reset, not
      // a blank screen.
      return initial;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private browsing, quota, and other cases where persistence is a bonus */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
