'use client';

// The platform operators.
//
// This was a server component that ran
// `prisma.pesuser.findMany({ where: { role: 'super-admin' } })` inline, with no
// token check in the page, no rule in roleAccess and no entry in middleware's
// matcher. Requesting /admin/super without being signed in at all returned
// every operator's name and email.
//
// It could not be fixed as a server component: the access token lives in
// localStorage, so the server only ever sees the `role` cookie, which the
// browser sets and anyone can forge. The data now comes from
// /api/admin/super-admins, which authorizes the Authorization header and
// answers the platform tier only.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/app/utils/apiFetch';

type SuperAdmin = { id: string; name: string; email: string };

export default function SuperAdminsPage() {
  const [admins, setAdmins] = useState<SuperAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await apiFetch('/api/admin/super-admins', { method: 'GET' });
        const body = await res.json();
        if (!live) return;
        if (!res.ok) {
          throw new Error(
            res.status === 403
              ? 'Only a platform operator can view this.'
              : body.error ?? 'Could not load platform operators.',
          );
        }
        setAdmins(body);
      } catch (err: any) {
        if (live) setError(err.message);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-canvas p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Super Admins</h1>
        <Link
          href="/admin/super/add"
          className="rounded-md bg-pes px-4 py-2 text-white hover:bg-pes-800"
        >
          Add New
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-pes border-t-transparent" />
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-lg border border-danger-100 bg-danger-50 p-4 text-sm text-danger-700"
        >
          {error}
        </div>
      ) : admins.length === 0 ? (
        <div className="italic text-muted">No super-admins found.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            >
              <div>
                <div className="font-semibold capitalize text-pes">{admin.name}</div>
                <div className="text-sm text-muted">{admin.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
