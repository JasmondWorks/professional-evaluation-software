'use client';

// Capability-based gating for the UI.
//
// Prefer this over checking the role name: a custom role (e.g. "Paginator")
// won't appear in any hardcoded allow-list, but its granted capabilities are
// knowable and carried in the JWT (see /api/login + compactPermissions).
//
//   const { can } = usePermissions();
//   {can('access_em') && <EditEmployeesButton />}
//
//   <Can permission="manage_review"><ReviewPanel /></Can>

import { ReactNode, useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import { PermissionKey } from './utils/roles';

type Perms = Partial<Record<PermissionKey, true>>;

function readPermsFromToken(): Perms {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('access_token');
  if (!token || token === 'undefined' || token === 'null') return {};
  try {
    const decoded: any = jwt.decode(token);
    return (decoded?.perms as Perms) ?? {};
  } catch {
    return {};
  }
}

export function usePermissions() {
  const [perms, setPerms] = useState<Perms>({});

  useEffect(() => {
    setPerms(readPermsFromToken());
  }, []);

  const can = (permission: PermissionKey) => perms[permission] === true;
  // True if the user has ANY of the given capabilities.
  const canAny = (...keys: PermissionKey[]) => keys.some((k) => perms[k] === true);

  return { perms, can, canAny };
}

// Renders children only when the user holds `permission`. Optional `fallback`
// shows when they don't.
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can } = usePermissions();
  return <>{can(permission) ? children : fallback}</>;
}
