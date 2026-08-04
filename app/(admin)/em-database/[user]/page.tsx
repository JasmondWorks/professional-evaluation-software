'use client';

// One employee's record: identity + access + permissions on the profile tab,
// and every result PES holds for them on the analysis tab.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { notify } from '@/lib/toast';
import { apiFetch } from '@/app/utils/apiFetch';
import {
  Alert,
  Badge,
  Button,
  Modal,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/components/ui';
import EmployeeProfile, { Employee } from './EmployeeProfile';
import PerformanceAnalysis from './PerformanceAnalysis';

export default function Page({ params }: { params: { user: string } }) {
  const router = useRouter();
  const [tab, setTab] = useState('profile');
  const [user, setUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        const res = await apiFetch('/api/getUserProfile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: params.user }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
        // The endpoint answers `{ data: ['no data'] }` when the id is unknown.
        if (!body?.data || Array.isArray(body.data)) throw new Error('not-found');
        if (!cancelled) setUser(body.data);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error && e.message === 'not-found'
              ? 'This employee is not in your organization, or the record no longer exists.'
              : 'The employee record could not be loaded. Check your connection and try again.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [params.user]);

  async function deleteUser() {
    if (!user) return;
    setDeleting(true);
    try {
      const res = await apiFetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id || Number(params.user), email: user.email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || `Request failed (${res.status})`);

      notify.success(`${user.name || user.email} was removed from ${user.org}.`);
      setConfirmOpen(false);
      router.push('/em-database');
    } catch (e) {
      notify.error(
        `Could not delete this employee: ${e instanceof Error ? e.message : 'unknown error'}`,
      );
      setDeleting(false);
    }
  }

  return (
    <main className="w-full min-h-screen bg-canvas">
      <div className="sticky top-0 z-10 bg-surface/85 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/em-database"
            aria-label="Back to employee database"
            className="p-2 -ms-2 rounded-lg text-muted hover:text-pes-700 hover:bg-line/60 transition-colors focus-visible:outline-none focus-visible:shadow-focus"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="min-w-0 flex-1">
            {loading ? (
              <Skeleton className="h-5 w-48" />
            ) : (
              <>
                <h1 className="text-base sm:text-lg font-semibold text-strong tracking-tight truncate">
                  {user?.name || 'Employee record'}
                </h1>
                {user && (
                  <p className="text-xs text-muted truncate">
                    {[user.role, user.faculty_college].filter(Boolean).join(' · ') || user.email}
                  </p>
                )}
              </>
            )}
          </div>

          {user && (
            <>
              {user.role && (
                <Badge tone="brand" className="hidden sm:inline-flex">
                  {user.role}
                </Badge>
              )}
              <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {loadError ? (
          <Alert tone="danger" title="Employee record unavailable">
            <p>{loadError}</p>
            <Link
              href="/em-database"
              className="inline-block mt-2 font-medium underline underline-offset-2"
            >
              Back to the employee database
            </Link>
          </Alert>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-5">
              <TabsTrigger value="profile">Employee profile</TabsTrigger>
              <TabsTrigger value="performance">Performance analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0">
              <EmployeeProfile
                user={user}
                loading={loading}
                onUserChange={(patch) => setUser((u) => (u ? { ...u, ...patch } : u))}
              />
            </TabsContent>

            <TabsContent value="performance" className="mt-0">
              {user && <PerformanceAnalysis staffId={user.id} staffName={user.name} />}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Modal
        isOpen={confirmOpen}
        setIsOpen={(open) => !deleting && setConfirmOpen(open)}
        title="Delete this employee?"
        description={
          user
            ? `${user.name || user.email} will be removed from ${user.org}, along with their access to PES. This cannot be undone.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" disabled={deleting} onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" loading={deleting} onClick={deleteUser}>
              Delete employee
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Their submitted assessment and stress data stays in the organization’s records.
        </p>
      </Modal>
    </main>
  );
}
