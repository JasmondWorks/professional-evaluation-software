'use client';

import { BackLink } from '@/app/components/ui';
import { RouteTabs } from '@/app/components/ui/tabs';

// Data fitting and staff determination are separate routes, so these are
// RouteTabs rather than panels. "Staff determination" matches on prefix because
// /evaluation/staff/sampling sits underneath it and should keep the tab lit.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full">
      <div className="border-b border-line bg-surface px-4 pt-6 sm:px-6">
        <BackLink href="/dashboard">Back to dashboard</BackLink>
        <h1 className="text-xl font-semibold tracking-tight text-strong sm:text-2xl">
          Determination of Supervisory / staff
        </h1>
        <div className="mt-3 pb-3">
          <RouteTabs
            items={[
              { href: '/evaluation', label: 'Data fitting' },
              { href: '/evaluation/staff', label: 'Staff determination', match: 'prefix' },
            ]}
          />
        </div>
      </div>
      {children}
    </main>
  );
}
