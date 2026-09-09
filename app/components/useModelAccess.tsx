'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/utils/apiFetch';
import { getAccessToken } from '@/app/utils/auth';
import type { ModelKey } from '@/app/lib/models/catalog';
import type { EntitlementKey } from '@/app/lib/billing/entitlements';

// What the signed-in person may reach in the models, straight from the server.
//
// The sidebar and the models page both use this rather than deciding from the
// role in the token: the engineer's access is a per-organization setting the
// admin changes, so the token cannot know it, and a nav link that appears when
// the server would refuse is worse than no link at all.

export type ModelAccess = {
  role: string;
  /** Only the organization admin runs a model or releases results. */
  canRunModels: boolean;
  models: ModelKey[];
  /** Sub-model keys the product plan includes. A page uses this to hide the
   *  method or index its tier did not buy, while `models` decides whether the
   *  page is reachable at all. */
  entitlements: EntitlementKey[];
  loading: boolean;
};

/** Whether the plan includes one sub-model. Mirrors assertEntitled on the
 *  server, which is what actually enforces it. */
export function hasEntitlement(access: ModelAccess, key: EntitlementKey): boolean {
  return access.entitlements.includes(key);
}

export function useModelAccess(): ModelAccess {
  const [state, setState] = useState<ModelAccess>({
    role: '',
    canRunModels: false,
    models: [],
    entitlements: [],
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    if (!getAccessToken()) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    (async () => {
      try {
        const res = await apiFetch('/api/model-access');
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState({ role: '', canRunModels: false, models: [], entitlements: [], loading: false });
          return;
        }
        setState({
          role: data.role ?? '',
          canRunModels: !!data.canRunModels,
          models: data.models ?? [],
          entitlements: data.entitlements ?? [],
          loading: false,
        });
      } catch {
        // A failed lookup must not open anything up: no access until we know.
        if (!cancelled) {
          setState({ role: '', canRunModels: false, models: [], entitlements: [], loading: false });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
